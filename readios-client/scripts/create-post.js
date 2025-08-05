async function initCreatePost() {
  const fakeInput = document.getElementById('fakeInput');
  const postModal = document.getElementById('postModal');
  const modalContent = document.querySelector('.modal-content');
  const cancelBtn = document.getElementById('cancelPostBtn');
  const postForm = document.getElementById('postForm');

  const postType = document.getElementById('postType');
  const contentField = document.getElementById('postContent');
  const mediaGallery = document.getElementById('mediaGallery');
  const mediaOptions = document.getElementById('mediaOptions');
  const postUrlInput = document.getElementById('postUrl');


  const images = [
    'images/books/book1.jpg',
    'images/books/book2.jpg',
    'images/books/book3.jpg',
    'images/books/book4.jpg',
    'images/books/book5.jpg',
    'images/books/book6.jpg',
    'images/books/book7.jpg',
    'images/books/book8.jpg',
    'images/books/book9.jpg',
    'images/books/book10.jpg'
  ];

  const videos = [
    '/images/videos/video1.mp4',
    '/images/videos/video2.mp4'
  ];

  fakeInput.addEventListener('click', () => {
    postModal.classList.remove('hidden');
    postForm.reset(); 
    updateFormFields(); 
  });

  cancelBtn.addEventListener('click', () => {
    closeModal();
  });

  postModal.addEventListener('click', (e) => {
    if (e.target === postModal) {
      closeModal();
    }
  });

  function closeModal() {
    postModal.classList.add('hidden');
    postForm.reset();
    mediaOptions.innerHTML = '';
    postUrlInput.value = '';
  }

  postType.addEventListener('change', updateFormFields);

  function updateFormFields() {
    const type = postType.value;

    if (type.includes('text')) {
      contentField.style.display = 'block';
      contentField.required = true;
    } else {
      contentField.style.display = 'none';
      contentField.required = false;
      contentField.value = '';
    }

    if (type.includes('image') || type.includes('video')) {
      mediaGallery.classList.remove('hidden');
      renderMedia(type.includes('video') ? videos : images, type.includes('video') ? 'video' : 'img');
    } else {
      mediaGallery.classList.add('hidden');
      mediaOptions.innerHTML = '';
      postUrlInput.value = '';
    }
  }

  function renderMedia(items, mediaType) {
    mediaOptions.innerHTML = '';

    items.forEach(src => {
      const el = document.createElement(mediaType);
      el.src = src;
      if (mediaType === 'video') el.controls = true;
      el.classList.add('media-item');

      el.addEventListener('click', () => {
        mediaOptions.querySelectorAll(mediaType).forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        postUrlInput.value = src;
      });

      mediaOptions.appendChild(el);
    });
  }
  
  const userId = localStorage.getItem("userId");

  let groupData = []; 
  const groupSelect = document.getElementById('postGroup');
  if (groupSelect) {
    try {
      const groupRes = await fetch(`http://localhost:5000/api/users/${userId}/groupPreviews`);
      const groupResJson = await groupRes.json();

      if (groupRes.ok && Array.isArray(groupResJson.groups)) {
        groupData = groupResJson.groups;
        groupData.forEach(group => {
          const option = document.createElement('option');
          option.value = group._id;
          option.textContent = group.name;
          groupSelect.appendChild(option);
        });
      } else {
        console.warn("לא נמצאו קבוצות או שגיאה בתשובה");
      }
    } catch (err) {
      console.error("שגיאה בטעינת הקבוצות:", err);
    }
  }

  
  const res = await fetch(`http://localhost:5000/api/users/${userId}`);
  const user = await res.json();
  window.loggedInUser = user;
  const postArea = document.getElementById("create-post-area");
  if (postArea) {
    postArea.innerHTML = `
      <img src="./images/users/${user.profileImage}.png" class="avatar me-2" alt="תמונת פרופיל של ${user.username}" />
      <div id="fakeInput" class="create-post-trigger">${user.username}, מה בא לך לשתף?</div>
    `;

  document.getElementById('fakeInput').addEventListener('click', () => {
    const postModal = document.getElementById('postModal');
    if (postModal) {
      postModal.classList.remove('hidden');
      postForm.reset();
      updateFormFields();
     }
    });
    }


  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const type = postType.value;
    const url = postUrlInput.value;
    const userId = localStorage.getItem("userId");
    const groupId = document.getElementById('postGroup')?.value || null;

    if (!title || (type.includes('text') && !content)) {
        alert("נא למלא כותרת ותוכן (אם נדרש).");
        return;
    }

    if ((type.includes('image') || type.includes('video')) && !url) {
        alert("יש לבחור מדיה.");
        return;
    }
    
    try {
        const res = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, type, url, userId, groupId })
        });

        const contentType = res.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            throw new Error(`Unexpected response: ${res.status} ${text}`);
        }

        if (!res.ok) throw new Error(data.message);

        closeModal();

        if (typeof window.addPostToFeed === 'function') {
            data.post.userId = window.loggedInUser;
            data.post.groupId = groupData.find(g => g._id === groupId);
            window.addPostToFeed(data.post, true);
        }

        } catch (err) {
        alert("שגיאה ביצירת פוסט: " + err.message);
        }

        console.log("פוסט נשלח:", { title, content, type, url });
    });
}
