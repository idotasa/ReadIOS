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
      const feedArea = document.querySelector('.feed-area');

      const postCard = document.createElement('div');
      postCard.classList.add('post-card');

      const userImage = post.user?.avatarUrl || '/default-avatar.png'; // או לפי userId
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
          <img src="${userImage}" class="avatar" />
          <div class="post-meta">
            <strong>${post.user?.name || 'משתמש אנונימי'}</strong>
            <div class="time">${createdAt}</div>
          </div>
        </div>
        <div class="post-body">
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          ${mediaHTML}
        </div>
        <div class="post-actions">
          <button class="like-btn">❤️ ${post.likes?.length || 0}</button>
          <button class="comment-btn">💬 תגובות</button>
        </div>
        <div class="comments-container hidden"></div>
      `;

      post.comments?.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.textContent = `${comment.content}`;
        postCard.querySelector('.comments-container').appendChild(commentDiv);
      });

      postCard.querySelector('.comment-btn').addEventListener('click', () => {
        const container = postCard.querySelector('.comments-container');
        container.classList.toggle('hidden');
      });

      postCard.querySelector('.like-btn').addEventListener('click', async () => {
        try {
          const res = await fetch(`/api/posts/${post._id}/like`, { method: 'PUT' });
          const updated = await res.json();
          postCard.querySelector('.like-btn').innerHTML = `❤️ ${updated.likes.length}`;
        } catch (err) {
          console.error("שגיאה בלייק:", err);
        }
      });

      feedArea.prepend(postCard);
    }
}
