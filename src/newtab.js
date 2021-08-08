//  Copyright 2021 Ilya Shchukin
//  Distributed under the Boost Software License, Version 1.0
//  See accompanying file LICENSE or copy at https://www.boost.org/LICENSE_1_0.txt

'use strict';

(function () {
	var document = window.document;
	var bookmarks = document.getElementById('bookmarks');
	var body = document.getElementsByTagName('body')[0];

	function make_bookmark(bookmark) {
		var icon = document.createElement('img');
		icon.src = 'chrome://favicon/size/16@1x/' + bookmark.url;
		var title = bookmark.title;
		var text = document.createTextNode(title);
		var bookmark_node = document.createElement('a');
		bookmark_node.appendChild(icon);
		bookmark_node.appendChild(text);
		bookmark_node.title = title;
		bookmark_node.href = bookmark.url;
		bookmark_node.className = 'bookmark';
		return bookmark_node;
	}

	function draw_bookmark_group(children) {
		var group = document.createElement('div');
		group.className = 'bookmark-group';
		children.forEach(child => {
			if (child.url) {
				group.appendChild(make_bookmark(child));
			}
			else {
				draw_bookmark_group(child.children);
			}
		});
		body.appendChild(group);
	}

	chrome.bookmarks.getTree(draw_bookmark_group);
}());