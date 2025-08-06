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
    const emptyMsg = document.getElementById('empty-feed-message');
    if (!posts || posts.length === 0 || posts.every(p => !p || Object.keys(p).length === 0)) {
        if (emptyMsg) {
            emptyMsg.style.display = 'block';
            emptyMsg.textContent = 'אין פוסטים בקבוצה הזו.';
        }
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    fetch('/api/groups/stats')
    .then(res => res.json())
    .then(data => {
        console.log(data.stats);
    });

    posts.forEach(post => {
      addPostToFeedGroup(post);
    });

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

document.addEventListener('DOMContentLoaded', () => {
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
        console.log("check")
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


