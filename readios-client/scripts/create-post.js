function initCreatePost(){
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
        postModal.classList.add('hidden');
        postForm.reset();
    });

    // סגירה בלחיצה מחוץ לחלון
    postModal.addEventListener('click', (e) => {
        if (!modalContent.contains(e.target)) {
        postModal.classList.add('hidden');
        postForm.reset();
        }
    });

    // שליחת הפוסט
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const type = document.getElementById('postType').value;
        const userId = "USER_ID_HERE"; // תקבל מהמשתמש המחובר
        const groupId = null; // או קבוצה אם יש

        if (!title || !content) {
        alert("נא למלא כותרת ותוכן.");
        return;
        }

        // בקשת POST לשרת
        try {
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, type, userId, groupId })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("✅ פוסט נוצר בהצלחה");
        postModal.classList.add('hidden');
        postForm.reset();

        } catch (err) {
            alert(" שגיאה ביצירת פוסט: " + err.message);
        }
        
        console.log("פוסט נשלח:", { title, content });

        postForm.reset();
        postModal.classList.add('hidden');
    });
}