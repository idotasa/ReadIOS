async function initGroupPage() {
  await loadGroupPostsFromServer();
}

async function loadGroupPostsFromServer() {
  try {
    const pathParts = window.location.pathname.split('/');
    const groupId = pathParts[pathParts.length - 1];
    

    const res = await fetch(`/api/posts/feed/groups/${groupId}`);
    if (!res.ok) throw new Error('שגיאה בשליפת פוסטים של הקבוצה');

    const data = await res.json();
    const posts = data.posts || [];

    if (posts.length === 0) {
      document.querySelector('.feed-area').innerHTML = '<p id="empty-feed-message">לא נמצאו פוסטים בקבוצה הזו.</p>';
      return;
    }

    posts.forEach(post => {
      addPostToFeedGroup(post);
    });

    console.log('groupId:', groupId);
  } catch (err) {
    console.error('שגיאה בטעינת פוסטים של הקבוצה:', err.message);
  }
}

function addPostToFeedGroup(post) {
  window.addPostToFeed(post);
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('scrollToTopBtn');

  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  initGroupPage();
});
