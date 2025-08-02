function initCreatePost() {
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
    'images/books/book1.png',
    'images/books/book2.png',
    'images/books/book3.png',
    'images/books/book4.png',
    //'images/books/book5.png',
    'images/books/book6.png',
    'images/books/book7.png',
    'images/books/book8.png',
    'images/books/book9.png',
    //'images/books/book10.png'
  ];

  const videos = [
    '/assets/vid1.mp4',
    '/assets/vid2.mp4'
  ];

  fakeInput.addEventListener('click', () => {
    postModal.classList.remove('hidden');
    updateFormFields(); 
  });

  cancelBtn.addEventListener('click', () => {
    closeModal();
  });

  postModal.addEventListener('click', (e) => {
    if (!modalContent.contains(e.target)) {
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

  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const type = postType.value;
    const url = postUrlInput.value;
    const userId = "USER_ID_HERE";
    const groupId = null;

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

        alert("✅ פוסט נוצר בהצלחה");
        closeModal();

        if (typeof window.addPostToFeed === 'function') {
            window.addPostToFeed(data);
        }

        if (typeof renderPost === 'function') {
            renderPost(data); 
        }

        } catch (err) {
        alert("שגיאה ביצירת פוסט: " + err.message);
        }

        console.log("פוסט נשלח:", { title, content, type, url });
    });
}
