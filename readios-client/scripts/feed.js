function initFeed() {

    fetch('components/create-post.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('create-post-container').innerHTML = html;
      const script = document.createElement('script');
      script.src = 'scripts/create-post.js';
      document.body.appendChild(script);
    });

    loadPostsFromServer();

    window.addPostToFeed = function(post, prepend = false) {
    const userId = localStorage.getItem("userId");
    const feedArea = document.querySelector('.feed-area');

    const postCard = document.createElement('div');
    postCard.classList.add('post-card');

    const userImage = post.user?.avatarUrl || '/default-avatar.png';
    const createdAt = new Date(post.createdAt).toLocaleString();
    const type = post.type || '';

    let mediaHTML = '';
    if (type.includes('image')) {
      mediaHTML += `<img src="${post.url}" class="post-media" />`;
    } else if (type.includes('video')) {
      mediaHTML += `<video src="${post.url}" controls class="post-media"></video>`;
    }

    const isOwner = userId === post.userId?._id;
    const deleteBtnHTML = isOwner
      ? `<button class="btn btn-light btn-sm rounded-circle border-0 delete-post-btn" title="מחק פוסט">
          <i class="bi bi-x-lg text-danger fs-5"></i>
        </button>`
      : '';

    postCard.innerHTML = `
    <div class="post-header d-flex justify-content-between align-items-start">
      <div class="d-flex align-items-center">
        <img src="${userImage}" class="avatar me-2" alt="User avatar" />
        <div class="post-meta">
          <strong class="username">${post.userId?.username}</strong>
          <div class="time">${createdAt}</div>
        </div>
      </div>
      ${deleteBtnHTML}
    </div>

      <div class="post-body">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-content">${post.content}</p>
        ${mediaHTML}
      </div>

      <div class="post-actions">
        <button class="btn btn-outline-danger like-btn">
          <i class="bi bi-heart"></i>
          <span class="like-count">${post.likes?.length || 0}</span>
        </button>
        <button class="comment-btn">💬 <span class="comment-count">${post.comments?.length || 0}</span></button>
      </div>

      <div class="comments-container hidden">
        <div class="comments-list">
          ${
            post.comments?.map(comment => `
              <div class="comment">${comment.content}</div>
            `).join('') || ''
          }
        </div>
        <textarea class="comment-input" placeholder="כתוב תגובה..." rows="2"></textarea>
        <button class="send-comment-btn">שלח</button>
        <button class="close-comments-btn">סגור</button>
      </div>
    `;

    postCard.querySelector('.comment-btn').addEventListener('click', () => {
      const container = postCard.querySelector('.comments-container');
      container.classList.toggle('hidden');
    });

  if (isOwner) {
  const deleteBtn = postCard.querySelector('.delete-post-btn');
  deleteBtn.addEventListener('click', async () => {

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "שגיאה במחיקה");

      postCard.remove();

    } catch (err) {
      console.error("שגיאה במחיקת פוסט:", err.message);
      alert("אירעה שגיאה במחיקת הפוסט.");
    }
  });
}


    postCard.querySelector('.like-btn').addEventListener('click', async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}/like`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
       });

       const data = await res.json();
       if (!res.ok) {
          console.error('שגיאה בלייק:', data.message);
          return;
        }

        const likeBtn = postCard.querySelector('.like-btn');
        const icon = likeBtn.querySelector('i');
        const countSpan = likeBtn.querySelector('.like-count');

        countSpan.textContent = data.likes.length;

         if (data.message === 'Liked') {
          icon.classList.remove('bi-heart');
          icon.classList.add('bi-heart-fill');
          icon.style.color = 'red';
        } else {
          icon.classList.remove('bi-heart-fill');
          icon.classList.add('bi-heart');
          icon.style.color = 'gray';
        }

        } catch (err) {
          console.error("שגיאה בלייק:", err);
        }
      });

    postCard.querySelector('.send-comment-btn').addEventListener('click', async () => {
      const input = postCard.querySelector('.comment-input');
      const content = input.value.trim();
      const commentsList = postCard.querySelector('.comments-list');

      if (!content) return;

      try {
        const res = await fetch(`/api/posts/${post._id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, content })
        });
        const newComment = await res.json();
        if (!res.ok) throw new Error(newComment.message || 'Failed to comment');
        const lastComment = newComment.comments[newComment.comments.length - 1];

        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.innerHTML = `
          <span class="comment-username" dir="rtl"><strong>${lastComment.userName}:</strong></span>
          <span class="comment-content" dir="auto">${lastComment.content}</span>
        `;
        postCard.querySelector('.comments-list').appendChild(commentDiv);
        input.value = '';
        const commentCountSpan = postCard.querySelector('.comment-count');
        if (commentCountSpan) {
          commentCountSpan.textContent = newComment.comments.length;
        }

        
      } catch (err) {
        console.error("שגיאה בשליחת תגובה:", err);
      }
    });

    postCard.querySelector('.close-comments-btn').addEventListener('click', () => {
      const container = postCard.querySelector('.comments-container');
      container.classList.add('hidden');
    });

    if (prepend) {
      feedArea.prepend(postCard);
    } else {
      feedArea.appendChild(postCard);
    }
  }
}

async function loadPostsFromServer() {
  try {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`/api/posts/feed/${userId}`);
    if (!res.ok) throw new Error('שגיאה בשליפת הפיד');

    const data = await res.json();
    const posts = data.posts || [];
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    posts.forEach(post => {
      window.addPostToFeed(post, false);
    });
  } catch (err) {
    console.error('שגיאה בטעינת פוסטים:', err.message);
  }
}
