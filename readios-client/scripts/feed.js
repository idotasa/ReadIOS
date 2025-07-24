// feed.js

const searchInput = document.querySelector('.search-bar');
const filterSelect = document.getElementById('filterPosts');
const emptyFeedMessage = document.getElementById('empty-feed-message');

// סינון פוסטים
function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  const posts = document.querySelectorAll('.post-card');
  let visibleCount = 0;

  posts.forEach(post => {
    const postText = post.querySelector('.post-body p').innerText.toLowerCase();
    const type = post.getAttribute('data-type');
    const matchesSearch = postText.includes(searchTerm);
    const matchesFilter = filter === 'all' || filter === type;

    if (matchesSearch && matchesFilter) {
      post.style.display = 'block';
      visibleCount++;
    } else {
      post.style.display = 'none';
    }
  });

  emptyFeedMessage.style.display = visibleCount === 0 ? 'block' : 'none';
}

searchInput.addEventListener('input', filterPosts);
filterSelect.addEventListener('change', filterPosts);

// יצירת פוסט חדש
const shareBtn = document.querySelector('.post-creation button');
const postInput = document.querySelector('.post-creation input');

document.addEventListener('DOMContentLoaded', () => {
  shareBtn?.addEventListener('click', () => {
    const text = postInput.value.trim();
    if (text === '') return;

    const newPost = createPost(text);
    const feedArea = document.querySelector('.feed-area');
    feedArea.insertBefore(newPost, feedArea.querySelector('.post-card'));

    animatePost(newPost);
    attachPostEvents(newPost);
    postInput.value = '';
    showNewPostNotification();
    filterPosts();
  });

  document.querySelectorAll('.post-card').forEach(post => attachPostEvents(post));
});

// אנימציה לפוסט חדש
function animatePost(post) {
  post.classList.add('just-added');
  post.style.backgroundColor = '#fff8d3';
  setTimeout(() => {
    post.style.backgroundColor = '';
    post.classList.remove('just-added');
  }, 2000);
}

// פונקציות תגובות ולייקים
function attachPostEvents(post) {
  const likeBtn = post.querySelector('.like-btn');
  const likeCountSpan = post.querySelector('.like-count');
  let likeCount = parseInt(likeCountSpan.textContent) || 0;
  let liked = false;

  likeBtn.addEventListener('click', () => {
    liked = !liked;
    likeCount += liked ? 1 : -1;
    likeBtn.classList.toggle('liked');
    likeBtn.classList.add('animate');
    likeCountSpan.textContent = likeCount;
    setTimeout(() => likeBtn.classList.remove('animate'), 300);
  });

  const commentBtn = post.querySelector('.comment-btn');
  const commentsSection = post.querySelector('.comments-section');
  const commentsList = post.querySelector('.comments-list');
  const commentInput = post.querySelector('.comment-input');
  const sendCommentBtn = post.querySelector('.send-comment-btn');
  const closeCommentsBtn = post.querySelector('.close-comments-btn');
  const typingIndicator = post.querySelector('.typing-indicator');
  const commentCountSpan = post.querySelector('.comment-count');

  commentBtn.addEventListener('click', () => {
    commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
    if (commentsSection.style.display === 'block') {
      commentInput.focus();
    }
  });

  closeCommentsBtn.addEventListener('click', () => {
    commentsSection.style.display = 'none';
  });

  commentInput.addEventListener('input', () => {
    typingIndicator.style.display = commentInput.value.trim() ? 'block' : 'none';
  });

  sendCommentBtn.addEventListener('click', () => {
    const text = commentInput.value.trim();
    if (!text) return;
    const newComment = document.createElement('div');
    newComment.classList.add('comment-item');
    newComment.textContent = `אתה: ${text}`;
    commentsList.appendChild(newComment);
    commentInput.value = '';
    typingIndicator.style.display = 'none';
    commentCountSpan.textContent = commentsList.children.length;
  });

  const shareBtn = post.querySelector('[aria-label="share"]');
  shareBtn?.addEventListener('click', () => {
    const sharePopup = document.getElementById('share-popup');
    sharePopup.style.display = 'block';
  });

  const closeBtn = post.querySelector('.close');
  closeBtn.addEventListener('click', () => {
    post.remove();
    filterPosts();
  });

  commentCountSpan.textContent = commentsList.children.length;
}

function showNewPostNotification() {
  const notification = document.getElementById('new-post-notification');
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}
