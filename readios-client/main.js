document.addEventListener('DOMContentLoaded', () => {
  const feed = document.getElementById('feed');

  // ⚠️ משתמש מחובר מדומה
  const currentUser = {
    id: '123456',
    username: 'username123'
  };
  document.getElementById('current-user').textContent = currentUser.username;

  // ⚠️ TODO: בהמשך שלוף מ-API
  const posts = [
    {
      _id: '1',
      title: "המלצה: הארי פוטר",
      content: "ספר קסום ומיוחד. ממליץ מאוד!",
      type: "image+text",
      url: "https://picsum.photos/seed/harry/400/200",
      likes: ["123"],
      comments: [
        { userId: { username: "משתמש1" }, content: "גם אני אהבתי!" }
      ],
      author: { username: "booklover21" }
    },
    {
      _id: '2',
      title: "חדש על המדף: Node.js",
      content: "מדריך למתחילים לפיתוח ב-JavaScript בצד השרת.",
      type: "text",
      likes: [],
      comments: [],
      author: { username: "dev_guru" }
    }
  ];

  posts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.classList.add('post');

    let media = '';
    if (post.type.includes('image') && post.url) {
      media = `<img src="${post.url}" alt="Post Image">`;
    } else if (post.type.includes('video') && post.url) {
      media = `<video controls src="${post.url}"></video>`;
    }

    postEl.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.content}</p>
      ${media}
      <p><strong>🖋️ נכתב על ידי:</strong> ${post.author.username}</p>
      <div class="likes">
        ❤️ <span class="like-count">${post.likes.length}</span> לייקים 
        <button class="like-btn" data-id="${post._id}">👍 לייק</button>
      </div>
      <div class="comments">
        <strong>💬 תגובות:</strong>
        <ul>
          ${post.comments.length ? post.comments.map(c => `<li><b>${c.userId.username}:</b> ${c.content}</li>`).join('') : '<li>אין תגובות עדיין</li>'}
        </ul>
      </div>
      <div class="comment-form">
        <textarea placeholder="כתוב תגובה..."></textarea>
        <button class="comment-btn" data-id="${post._id}">📨 שלח תגובה</button>
      </div>
    `;

    // לייק
    const likeBtn = postEl.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => {
      alert(`TODO: שלח לייק לשרת עבור פוסט ${post._id}`);
    });

    // תגובה
    const commentBtn = postEl.querySelector('.comment-btn');
    commentBtn.addEventListener('click', () => {
      const textarea = postEl.querySelector('textarea');
      const commentText = textarea.value.trim();
      if (commentText) {
        alert(`TODO: שלח תגובה "${commentText}" לשרת עבור פוסט ${post._id}`);
        textarea.value = '';
      }
    });

    feed.appendChild(postEl);
  });
});
