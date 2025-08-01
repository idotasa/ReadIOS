function initFeed() {
  const fakeInput = document.getElementById('fakeInput');
  const postModal = document.getElementById('postModal');
  const modalContent = document.querySelector('.modal-content');
  const cancelBtn = document.getElementById('cancelPostBtn');
  const postForm = document.getElementById('postForm');

  // פתיחה
  fakeInput.addEventListener('click', () => {
    postModal.classList.remove('hidden');
  });

  // סגירה בלחיצה על ביטול
  cancelBtn.addEventListener('click', () => {
    postForm.reset();
    postModal.classList.add('hidden');
  });

  // סגירה בלחיצה מחוץ לחלון
  postModal.addEventListener('click', (e) => {
    if (!modalContent.contains(e.target)) {
      postForm.reset();
      postModal.classList.add('hidden');
    }
  });

  // שליחת הפוסט
  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    console.log("פוסט נשלח:", { title, content });

    // שליחה לשרת תוכל להוסיף כאן
    postForm.reset();
    postModal.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', initPostModal);
