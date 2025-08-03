function initFeed() {

    fetch('components/create-post.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('create-post-container').innerHTML = html;
      const script = document.createElement('script');
      script.src = 'scripts/create-post.js';
      document.body.appendChild(script);
    });

    window.addPostToFeed = function(post) {
    const userId = localStorage.getItem("userId"); // להחליף ברגע שמחברים את הlogin
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

    postCard.innerHTML = `
      <div class="post-header">
        <img src="${userImage}" class="avatar me-2" alt="User avatar" />
        <div class="post-meta">
          <strong class="username">${post.user?.name || 'משתמש אנונימי'}</strong>
          <div class="time">${createdAt}</div>
        </div>
      </div>

      <div class="post-body">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-content">${post.content}</p>
        ${mediaHTML}
      </div>

      <div class="post-actions">
        <button class="like-btn">❤️ <span class="comment-count">${post.likes?.length || 0}</span></button>
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

    postCard.querySelector('.like-btn').addEventListener('click', async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}/like`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
       });
       if (!res.ok) {
          const error = await res.json();
          console.error('שגיאה בלייק:', error.message);
          return;
        }
        const updated = await res.json();
        postCard.querySelector('.like-btn').innerHTML = `❤️ ${updated.likes.length}`;
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

        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.textContent = content;
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

    feedArea.prepend(postCard);
  }
}