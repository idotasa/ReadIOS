
async function loadComponent(id, path) {
    const res = await fetch(path);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}


async function loadAllComponents() {
    await loadComponent('topbar-placeholder', 'components/topbar.html');
    if (typeof initTopbar === 'function') {
        initTopbar();
    } else {
        console.warn("initTopbar function not found in topbar.js");
    }

    await loadComponent('sidebar-left-placeholder', 'components/sidebar-left.html');
    if (typeof initSidebarLeft === 'function') {
        initSidebarLeft();
    } else {
        console.warn("initSidebarLeft function not found in sidebar-left.js");
    }

    await loadComponent('sidebar-right-container', 'components/sidebar-right.html');
    if (typeof initSidebarRight === 'function') {
        initSidebarRight();
    } else {
        console.error("initSidebarRight function not found in sidebar-right.js. Is sidebar-right.js loaded correctly?");
    }

    await loadComponent('feed-placeholder', 'components/feed.html');
    if (typeof initFeed === 'function') {
        initFeed();
    } else {
        console.warn("initFeed function not found in feed.js");
    }

    await loadComponent('create-post-container', 'components/create-post.html');
    if (typeof initCreatePost === 'function') {
        initCreatePost();
    } else {
        console.warn("initCreatePost function not found in create-post.js");
    }

    await loadComponent('group-page-container', 'components/group-page.html');
    if (typeof initGroupPage === 'function') {
        initGroupPage();
    } else {
        console.warn("initGroupPage function not found in GroupPage.js");
    }
    
    
}

document.addEventListener("DOMContentLoaded", () => {
    loadAllComponents();
});