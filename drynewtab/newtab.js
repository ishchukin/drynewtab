//  Copyright 2021-2022 Ilya Shchukin
//  Distributed under the Boost Software License, Version 1.0
//  See accompanying file LICENSE or copy at https://www.boost.org/LICENSE_1_0.txt

'use strict';

(function () {
    const document = window.document
    const body = document.getElementsByTagName('body')[0]

    const bookmarkTemplate = document.createElement('a')
    bookmarkTemplate.className = 'bookmark'
    const icon = document.createElement('img')
    icon.alt = ''
    icon.width = 16
    icon.height = 16
    const span = document.createElement('span')
    bookmarkTemplate.appendChild(icon)
    bookmarkTemplate.appendChild(span)

    function makeBookmark(bookmark) {
        const bookmarkNode = bookmarkTemplate.cloneNode(true)
        bookmarkNode.children[0].src = 'chrome://favicon/size/16@1x/' + bookmark.url
        bookmarkNode.title = bookmark.title
        bookmarkNode.children[1].textContent = bookmark.title
        bookmarkNode.href = bookmark.url
        return bookmarkNode
    }

    function uncollapseBookmarkFolder() {
        this.children[0].className = 'triangle-down';
        this.onclick = collapseBookmarkFolder;
        const content = document.createElement('div');
        content.className = 'bookmark-folder-content';
        chrome.storage.local.get('collapsed', storage => {
            const updated = (storage.collapsed || []).filter(item => item !== this.id);
            chrome.storage.local.set({ collapsed: updated });
            chrome.bookmarks.getSubTree(this.id, node => {
                drawBookmarkGroup(node[0].children, content, updated || []);
            });
            this.parentNode.insertBefore(content, this.nextSibling);
        })
    }

    function collapseBookmarkFolder() {
        this.onclick = uncollapseBookmarkFolder
        chrome.storage.local.get('collapsed', storage => {
            if (storage.collapsed) {
                storage.collapsed.push(this.id)
            } else {
                storage.collapsed = [ this.id ]
            }
            chrome.storage.local.set({ collapsed: storage.collapsed })
        })
        this.children[0].className = 'triangle-right'
        this.nextElementSibling.remove()
    }

    function drawBookmarkGroup(children, context, collapsed) {
        let group
        children.forEach(child => {
            if (child.url) {
                if (!group) {
                    group = document.createElement('div')
                    group.className = 'bookmark-group'
                }
                group.appendChild(makeBookmark(child))
            } else {
                if (group) {
                    context.appendChild(group)
                    group = null
                }
                const folder = document.createElement('div')
                folder.className = 'bookmark-folder'
                const header = document.createElement('button')
                header.className = 'bookmark-folder-header'
                header.id = child.id
                header.type = 'button'
                const content = document.createElement('div')
                content.className = 'bookmark-folder-content'
                const triangle = document.createElement('div')
                if (!collapsed.includes(child.id)) {
                    header.onclick = collapseBookmarkFolder
                    triangle.className = 'triangle-down'
                    drawBookmarkGroup(child.children, content, collapsed)
                } else {
                    header.onclick = uncollapseBookmarkFolder
                    triangle.className = 'triangle-right'
                }
                header.appendChild(triangle)
                header.appendChild(document.createTextNode(child.title))
                folder.appendChild(header)
                folder.appendChild(content)
                context.appendChild(folder)
            }
        })
        if (group) {
            context.appendChild(group)
        }
    }

    chrome.storage.local.get('collapsed', storage =>
        chrome.bookmarks.getTree(root => {
            drawBookmarkGroup(root[0].children, body, storage.collapsed || [])
        })
    )
}())
