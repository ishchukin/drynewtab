//  Copyright 2021 Ilya Shchukin
//  Distributed under the Boost Software License, Version 1.0
//  See accompanying file LICENSE or copy at https://www.boost.org/LICENSE_1_0.txt

'use strict';

(function () {
	var document = window.document;
	var bookmarks = document.getElementById('bookmarks');
	var body = document.getElementsByTagName('body')[0];

	var bookmark_template = document.createElement('a');
	bookmark_template.className = 'bookmark';
	var icon = document.createElement('img');
	icon.alt = '';
	icon.width = 16;
	icon.height = 16;
	var span = document.createElement('span');
	bookmark_template.appendChild(icon);
	bookmark_template.appendChild(span);

	function make_bookmark(bookmark) {
		var bookmark_node = bookmark_template.cloneNode(true);
		bookmark_node.children[0].src = 'chrome://favicon/size/16@1x/' + bookmark.url;
		bookmark_node.title = bookmark.title;
		bookmark_node.children[1].textContent = bookmark.title;
		bookmark_node.href = bookmark.url;
		return bookmark_node;
	}

	function draw_bookmark_group(children, context) {
		var group;
		children.forEach(child => {
			if (child.url) {
				if (!group) {
					group = document.createElement('div');
					group.className = 'bookmark-group';
				}
				group.appendChild(make_bookmark(child));
			}
			else {
				if (group) {
					context.appendChild(group);
					group = null;
				}
				var folder = document.createElement('div');
				folder.className = 'bookmark-folder';
				var header = document.createElement('button');
				header.className = 'bookmark-folder-header';
				header.type = 'button';
				var content = document.createElement('div');
				content.className = 'bookmark-folder-content';
				var triangle = document.createElement('div');
				triangle.className = 'triangle-down';
				header.appendChild(triangle);
				header.appendChild(document.createTextNode(child.title));
				folder.appendChild(header);
				folder.appendChild(content);
				draw_bookmark_group(child.children, content);
				context.appendChild(folder);
			}
		});
		if (group) {
		context.appendChild(group);
		}
	}

	chrome.bookmarks.getTree(function (root) {
		draw_bookmark_group(root[0].children, body);
	});
}());
