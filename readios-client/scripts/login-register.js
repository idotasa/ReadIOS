function openPopup() {
  const popup = document.getElementById('registerPopup');
  popup.classList.remove('d-none');
}

function closePopup() {
  const popup = document.getElementById('registerPopup');
  popup.classList.add('d-none');
}


// listens to pressing the link "Register here"
document.addEventListener("DOMContentLoaded", function () {
  const openRegisterLink = document.getElementById("openRegister");
  if (openRegisterLink) {
    openRegisterLink.addEventListener("click", function (e) {
      e.preventDefault(); 
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

// hide and show password
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

// show success message 
function showSuccessMessage() {
  const message = document.getElementById('successMessage');
  message.classList.remove('d-none');

  setTimeout(() => {
    message.classList.add('d-none');
  }, 3000); 
}

// listens to sending the register form
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector(".register-form");

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault(); 

    showSuccessMessage(); // sucess message 
    registerForm.reset(); // clean rows
    closePopup(); // close popup
  });
});

window.addEventListener("click", function (event) {
  const popup = document.getElementById("registerPopup");
  const popupContent = document.querySelector(".popup-content");

  if (
    popup &&
    !popup.classList.contains("d-none") &&
    event.target === popup
  ) {
    closePopup();
  }
});
