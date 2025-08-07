let allGroupPosts = [];

async function initGroupPage() {
  await loadGroupPostsFromServer();
  setupSearchGroup();
}

async function loadGroupPostsFromServer() {
  try {
    const pathParts = window.location.pathname.split('/');
    const groupId = pathParts[pathParts.length - 1];
    const userId = localStorage.getItem("userId");

    const groupRes = await fetch(`/api/groups/${groupId}`);
    if (!groupRes.ok) throw new Error('שגיאה בשליפת נתוני הקבוצה');

    const groupData = await groupRes.json();
    const groupOwnerId = groupData.owner;

    const isOwner = userId === groupOwnerId;
    if (isOwner) insertDeleteGroupButton(groupId, userId);

    const res = await fetch(`/api/posts/feed/groups/${groupId}`);
    if (!res.ok) throw new Error('שגיאה בשליפת פוסטים של הקבוצה');

    const data = await res.json();
    const posts = data.posts || [];
    const emptyMsg = document.getElementById('empty-feed-message');

    if (!posts.length || posts.every(p => !p || Object.keys(p).length === 0)) {
      if (emptyMsg) {
        emptyMsg.style.display = 'block';
        emptyMsg.textContent = 'אין פוסטים בקבוצה הזו.';
      }
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    allGroupPosts = posts;
    renderGroupPosts(posts);

  } catch (err) {
    console.error('שגיאה בטעינת פוסטים של הקבוצה:', err.message);
  }
}

function renderGroupPosts(posts) {
  const feedArea = document.querySelector('.feed-area');
  feedArea.innerHTML = '';
  posts.forEach(post => renderPostCardForGroup(post));
}

function renderPostCardForGroup(post) {
  const userId = localStorage.getItem("userId");
  const feedArea = document.querySelector('.feed-area');

  const postCard = document.createElement('div');
  postCard.classList.add('post-card');

  const createdAt = new Date(post.createdAt).toLocaleString();
  const type = post.type || '';

  let mediaHTML = '';
  if (type.includes('image')) {
    mediaHTML += `<img src="/${post.url}" class="post-media" />`;
  } else if (type.includes('video')) {
    mediaHTML += `<video src="${post.url}" controls class="post-media"></video>`;
  }

  postCard.innerHTML = `
    <div class="post-header d-flex justify-content-between align-items-start">
      <div class="d-flex align-items-center">
        <img src="/images/users/${post.userId.profileImage}.png" class="avatar me-2" alt="User avatar" />
        <div class="post-meta">
          <strong class="username">${post.userId?.username}</strong>
          <div class="time">${createdAt}</div>
        </div>
      </div>
    </div>
    <div class="post-body">
      <h3 class="post-title">${post.title}</h3>
      <p class="post-content">${post.content}</p>
      ${mediaHTML}
    </div>
  `;

  feedArea.appendChild(postCard);
}

function setupSearchGroup() {
  const searchInput = document.getElementById('postSearchInput');
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
      renderGroupPosts(allGroupPosts);
      return;
    }

    const filteredPosts = allGroupPosts.filter(post =>
      post.title && post.title.toLowerCase().includes(searchTerm)
    );

    renderGroupPosts(filteredPosts);
  });
}

function insertDeleteGroupButton(groupId, userId) {
  const parentContainer = document.querySelector('.col-12.col-md-8');
  if (!parentContainer) return;

  if (document.querySelector('.delete-group-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'btn btn-danger mt-3 delete-group-btn';
  btn.textContent = ' מחיקת קבוצה 🗑️';

  btn.addEventListener('click', async () => {
    const confirmDelete = confirm('האם אתה בטוח שברצונך למחוק את הקבוצה? כל הפוסטים יימחקו!');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/groups/${groupId}/owner/${userId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה במחיקת הקבוצה");

      alert("הקבוצה נמחקה בהצלחה");
      window.location.href = '/';

    } catch (err) {
      console.error('שגיאה במחיקת קבוצה:', err.message);
      alert("אירעה שגיאה בעת מחיקת הקבוצה");
    }
  });

  parentContainer.prepend(btn);
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

  const currentGroupId = window.location.pathname.split('/').pop();
  fetch('/api/groups/stats')
    .then(res => res.json())
    .then(data => {
      const allGroups = data.stats || [];
      const group = allGroups.find(g => g.groupId === currentGroupId);

      const container = document.getElementById('group-stats-table');
      if (!container) return;
      if (!group) {
        container.innerHTML = '<p>לא נמצאו פוסטים בקבוצה הזו.</p>';
        return;
      }

      const table = document.createElement('table');
      table.className = 'table table-striped table-bordered text-center';

      table.innerHTML = `
        <thead class="table-dark">
          <tr>
            <th>שם קבוצה</th>
            <th>מספר חברים</th>
            <th>מספר פוסטים</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${group.name}</td>
            <td>${group.members}</td>
            <td>${group.posts}</td>
          </tr>
        </tbody>
      `;

      container.appendChild(table);
    })
    .catch(err => {
      console.error('שגיאה בשליפת הקבוצה:', err);
      document.getElementById('group-stats-table').innerHTML = '<p class="text-danger">אירעה שגיאה בטעינת הקבוצה.</p>';
    });
});
