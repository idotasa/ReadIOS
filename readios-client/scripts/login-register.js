function openPopup() {
  document.getElementById('registerPopup').classList.remove('d-none');
}
function closePopup() {
  document.getElementById('registerPopup').classList.add('d-none');
}

function togglePassword(id) {
  const inp = document.getElementById(id);
  inp.type = (inp.type === 'password') ? 'text' : 'password';
}

async function registerUser(body) {
  try {
    const r = await fetch('/api/users/register', {  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const msg = await r.text();       
      throw new Error(msg || `HTTP ${r.status}`);
    }

    const data = await r.json();          
    console.log('✅ Registered', data);
    showSuccess('Registration successful ✔️');
    closePopup(); 

  } catch (err) {
    console.error('❌ Register failed:', err.message);
    alert('Register failed: ' + err.message);
  }
}

async function loginUser(body) {
  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem("userId", data.user._id);

    showSuccess('Login succeeded ✔️');

    window.location.href = '/';
  } catch (err) {
    showError(err.message);
  }
}


function showSuccess(txt) {
  const box = document.getElementById('successMessage');
  box.textContent = txt;
  box.classList.remove('d-none');
  setTimeout(() => box.classList.add('d-none'), 3000);
}
function showError(txt) {
  alert('❌ ' + txt);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('openRegister')
          ?.addEventListener('click', e => { e.preventDefault(); openPopup(); });

  document.querySelector('.register-form')
          ?.addEventListener('submit', e => {
              e.preventDefault();
              const body = {
                username:  e.target['reg-username'].value,
                email:     e.target['reg-email'].value,
                password:  e.target['reg-password'].value,
                location:  e.target['reg-location'].value,
                profileImage: e.target['reg-profileImage'].value
              };
              registerUser(body);
            });

  document.querySelector('.login-form')
          ?.addEventListener('submit', e => {
              e.preventDefault();
              const body = {
                username: e.target['username'].value,
                password: e.target['password'].value
              };
              loginUser(body);
            });
});

window.addEventListener('click', ev => {
  const popup = document.getElementById('registerPopup');
  if (!popup.classList.contains('d-none') && ev.target === popup) closePopup();
});


document.addEventListener("DOMContentLoaded", () => {
  const imageContainer = document.getElementById("profileImages");
  const hiddenInput = document.getElementById("reg-profileImage");
  const preview = document.getElementById("profilePreview");

  const imageNames = Array.from({ length: 10 }, (_, i) => `user${i + 1}`);

  imageNames.forEach(name => {
    const img = document.createElement("img");
    img.src = `images/users/${name}.png`;
    img.alt = name;
    img.classList.add("profile-option");
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.borderRadius = "50%";
    img.style.margin = "5px";
    img.style.cursor = "pointer";
    img.style.border = "2px solid transparent";

    img.addEventListener("click", () => {
      document.querySelectorAll(".profile-option").forEach(el => {
        el.style.border = "2px solid transparent";
      });

      img.style.border = "2px solid #1877f2";

      hiddenInput.value = name;
      preview.src = img.src;
      preview.style.display = "block";
    });

    imageContainer.appendChild(img);
  });
});

