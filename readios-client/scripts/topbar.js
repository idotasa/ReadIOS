async function initTopbar() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "/login";
    return;
  }

  try {
    const resUser = await fetch(`http://localhost:5000/api/users/${userId}`);
    if (!resUser.ok) throw new Error(`Invalid userId: ${resUser.status} ${resUser.statusText}`);

    const user = await resUser.json();
    document.getElementById("current-user").textContent = user.username;
    document.getElementById("profile-img").src = `../images/users/${user.profileImage}.png`;
    document.getElementById("profile-img").alt = `${user.username} profile image`;
  } catch (err) {
    console.error("Error on TopBar", err);
    window.location.href = "/login";
    return;
  }

  const profileModal = document.getElementById("profileModal");
  profileModal.addEventListener("show.bs.modal", async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);

      const user = await res.json();

      document.getElementById("modal-username").value = user.username;
      document.getElementById("modal-email").value = user.email;
      document.getElementById("modal-location").value = user.location;
      document.getElementById("modal-profileImage").value = user.profileImage;
      document.getElementById("modal-profile-image").src = `../images/users/${user.profileImage}.png`;
      document.getElementById("modal-profile-image").dataset.selectedImage = user.profileImage;

      const editBtn = document.getElementById("editImageBtn");
      const picker = document.getElementById("imagePicker");
      const container = picker.querySelector("div");

      if (!editBtn.dataset.connected) {
        editBtn.addEventListener("click", () => {
          picker.classList.toggle("d-none");

          if (picker.dataset.loaded === "true") return;

          for (let i = 1; i <= 10; i++) {
            const img = document.createElement("img");
            img.src = `../images/users/user${i}.png`;
            img.alt = `user${i}`;
            img.className = "selectable-img";
            img.style = "width:48px; height:48px; border-radius:50%; cursor:pointer; border: 2px solid transparent;";

            img.addEventListener("click", () => {
              document.getElementById("modal-profile-image").src = img.src;
              document.getElementById("modal-profile-image").dataset.selectedImage = `user${i}`;
              document.getElementById("modal-profileImage").value = `user${i}`;

              container.querySelectorAll("img").forEach(im => im.style.border = "2px solid transparent");
              img.style.border = "2px solid #0d6efd";

              picker.classList.add("d-none");
            });

            container.appendChild(img);
          }

          picker.dataset.loaded = "true";
        });

        editBtn.dataset.connected = "true";
      }
    } catch (error) {
      console.error("שגיאה בטעינת נתוני המשתמש למודל:", error);
    }
  });

  document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const email = document.getElementById("modal-email").value.trim();
    const location = document.getElementById("modal-location").value.trim();
    const profileImage = document.getElementById("modal-profile-image").dataset.selectedImage;

    try {
      const updateRes = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, location, profileImage })
      });

      const data = await updateRes.json();

      if (!updateRes.ok) {
        console.error(data.message);
        return;
      }

      document.getElementById("current-user").textContent = data.user.username;
      document.getElementById("profile-img").src = `../images/users/${data.user.profileImage}.png`;

      const modalInstance = bootstrap.Modal.getInstance(profileModal);
      modalInstance.hide();
    } catch (err) {
      console.error("שגיאה בעדכון פרטי המשתמש:", err);
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/login";
  });

  document.getElementById("deleteUserBtn")?.addEventListener("click", async () => {
    const confirmDelete = confirm("האם אתה בטוח שברצונך למחוק את המשתמש שלך? פעולה זו אינה ניתנת לשחזור.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      alert("שגיאה במחיקת המשתמש: " + err.message);
      console.error(err);
    }
  });
}

document.addEventListener("DOMContentLoaded", initTopbar);
