localStorage.setItem("userId", "6877ab02f2212b55a0e18706");
// localStorage.setItem("userId", "6877acca8b328f4e441b87ec");
localStorage.setItem("userName", "851idot");

function initTopbar() {
  const openFormBtn = document.getElementById('openPostFormBtn');
  const formContainer = document.getElementById('postFormContainer');
  const cancelBtn = document.getElementById('cancelPostBtn');
  const postForm = document.getElementById('postForm');
  const feedArea = document.querySelector('.feed-area');
  const emptyFeedMessage = document.getElementById('empty-feed-message');

  if (!openFormBtn || !formContainer || !cancelBtn || !postForm) {
    console.warn("topbar elements not found - make sure HTML is loaded first");
    return;
  }

  openFormBtn.addEventListener('click', () => {
    formContainer.style.display = 'flex';
    openFormBtn.style.display = 'none';
  });

  cancelBtn.addEventListener('click', () => {
    formContainer.style.display = 'none';
    openFormBtn.style.display = 'inline-block';
    postForm.reset();
  });

  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = postForm.title.value.trim();
    const content = postForm.content.value.trim();

    if (!title || !content) {
      alert('אנא מלא את כל השדות');
      return;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type: 'text' })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'שגיאה ביצירת הפוסט');
      }

      const newPost = await response.json();
      addPostToFeed(newPost);

      postForm.reset();
      formContainer.style.display = 'none';
      openFormBtn.style.display = 'inline-block';
      if (emptyFeedMessage) emptyFeedMessage.style.display = 'none';

    } catch (error) {
      alert(error.message);
    }
  });

  function addPostToFeed(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    postDiv.setAttribute('data-type', post.type || 'text');
    postDiv.innerHTML = `
      <h5>${escapeHtml(post.title)}</h5>
      <p>${escapeHtml(post.content)}</p>
      <small>נוצר בתאריך: ${new Date(post.createdAt).toLocaleString()}</small>
    `;
    feedArea.insertBefore(postDiv, feedArea.firstChild);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
