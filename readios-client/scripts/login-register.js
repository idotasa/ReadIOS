function openPopup() {
  const popup = document.getElementById('registerPopup');
  popup.classList.remove('d-none');
}

function closePopup() {
  const popup = document.getElementById('registerPopup');
  popup.classList.add('d-none');
}

// מאזין ללחיצה על הקישור "Register here"
document.addEventListener("DOMContentLoaded", function () {
  const openRegisterLink = document.getElementById("openRegister");
  if (openRegisterLink) {
    openRegisterLink.addEventListener("click", function (e) {
      e.preventDefault(); // כדי למנוע גלילה למעלה
      openPopup();
    });
  }

  const registerForm = document.querySelector(".register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showSuccessMessage();
      registerForm.reset();
      closePopup();
    });
  }
});


// מאפשר להחליף בין הצגת הסיסמה להסתרתה
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

// הצגת הודעת הצלחה
function showSuccessMessage() {
  const message = document.getElementById('successMessage');
  message.classList.remove('d-none');

  setTimeout(() => {
    message.classList.add('d-none');
  }, 3000); // מסתיר אחרי 3 שניות
}

// מאזין לשליחת טופס ההרשמה
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector(".register-form");

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault(); // מונע שליחה אמיתית של הטופס

    // בעתיד: שליחה ל-backend

    showSuccessMessage(); // הודעת הצלחה
    registerForm.reset(); // ניקוי שדות
    closePopup(); // סגירת הפופאפ
  });
});
