// postFeed.js

const searchInput = document.querySelector('.search-bar');
const filterSelect = document.getElementById('filterPosts');
const toggleThemeBtn = document.getElementById('toggle-theme');
const scrollBtn = document.getElementById('scrollToTopBtn');
const body = document.body;
const emptyFeedMessage = document.getElementById('empty-feed-message');


// On page load
window.addEventListener('DOMContentLoaded', () => {
  toggleThemeBtn.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
  document.querySelectorAll('.post-card').forEach(post => attachPostEvents(post));
});

// Filtering posts
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

// Scroll button
window.addEventListener('scroll', () => {
  scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});
scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Share popup
const sharePopup = document.getElementById('share-popup');
document.querySelectorAll('.btn-action[aria-label="share"]').forEach(button => {
  button.addEventListener('click', () => {
    sharePopup.style.display = 'block';
  });
});
document.getElementById('close-share-popup').addEventListener('click', () => {
  sharePopup.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === sharePopup) {
    sharePopup.style.display = 'none';
  }
});

// Create post
const shareBtn = document.querySelector('.post-creation button');
const postInput = document.querySelector('.post-creation input');
document.addEventListener('DOMContentLoaded', () => {
  shareBtn.addEventListener('click', () => {
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
});

function createPost(text) {
  const post = document.createElement('div');
  post.classList.add('post-card');
  post.setAttribute('data-type', 'text');
  post.innerHTML = `
    <div class="post-top d-flex justify-content-between align-items-start">
      <div class="d-flex align-items-center">
        <img src="./images/colman_image.jpg" class="avatar me-2" alt="Avatar" />
        <div>
          <strong>המכללה למנהל</strong><br />
          <small class="text-muted">הרגע</small>
        </div>
      </div>
      <div class="post-options">
        <span class="dots" aria-label="אפשרויות">⋯</span>
        <span class="close" aria-label="סגור פוסט">✕</span>
      </div>
    </div>

    <div class="post-body">
      <p>${text}</p>
    </div>

    <div class="post-reactions" aria-label="תגובות ולייקים">
      👍 <span class="like-count">0</span> · 💬 <span class="comment-count">0</span> תגובות
    </div>

    <div class="post-footer">
      <button class="like-btn" aria-label="like">👍 לייק</button>
      <button class="comment-btn btn-action" aria-label="commit">💬 תגובה</button>
      <button class="btn-action" aria-label="share">↗️ שתף</button>
    </div>

    <div class="comments-section" style="display: none;">
      <div class="typing-indicator text-muted" style="display: none;">אתה כותב תגובה...</div>
      <div class="comments-list"></div>
      <textarea class="comment-input" placeholder="כתוב תגובה..." rows="2"></textarea>
      <button class="send-comment-btn">שלח</button>
      <button class="close-comments-btn">בטל</button>
    </div>
  `;
  return post;
}

function animatePost(post) {
  post.classList.add('just-added');
  post.style.backgroundColor = '#fff8d3';
  setTimeout(() => {
    post.style.backgroundColor = '';
    post.classList.remove('just-added');
  }, 2000);
}

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
  shareBtn.addEventListener('click', () => {
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
