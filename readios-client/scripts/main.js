// טוען את הרכיבים לתוך ה-HTML
async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadComponent('topbar-placeholder', 'components/topbar.html');
loadComponent('sidebar-left-placeholder', 'components/sidebar-left.html');
loadComponent('sidebar-right-placeholder', 'components/sidebar-right.html');
loadComponent('feed-placeholder', 'components/feed.html');

async function loadAllComponents() {
  await loadComponent('topbar-placeholder', 'components/topbar.html');
  initTopbar(); // כאן תפעיל את ה־JS של הטופבר

  await loadComponent('sidebar-left-placeholder', 'components/sidebar-left.html');
  initSidebarLeft(); // אם יש

  await loadComponent('sidebar-right-placeholder', 'components/sidebar-right.html');
  initSidebarRight(); // אם יש

  await loadComponent('feed-placeholder', 'components/feed.html');
  initFeed(); // אם יש
}

loadAllComponents();
