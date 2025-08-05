localStorage.setItem("userId", "6877ab02f2212b55a0e18706");

async function initTopbar() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "/login.html";
    return;
  }

  // שליפת נתוני המשתמש להצגה ב-Topbar
  try {
    const resUser = await fetch(`http://localhost:5000/api/users/${userId}`);
    if (!resUser.ok) throw new Error(`Invalid userId: ${resUser.status} ${resUser.statusText}`);

    const user = await resUser.json();
    document.getElementById("current-user").textContent = user.username;
    document.getElementById("profile-img").src = `../images/users/${user.profileImage}.png`;
    document.getElementById("profile-img").alt = `${user.username} profile image`;
  } catch (err) {
    console.error("Error on TopBar", err);
    window.location.href = "/login.html";
    return;
  }

  // כשנפתח המודל - טוענים את המידע מחדש
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
    } catch (error) {
      console.error("שגיאה בטעינת נתוני המשתמש למודל:", error);
    }
  });

  // שמירת שינויים מהמודל
  document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const email = document.getElementById("modal-email").value.trim();
    const location = document.getElementById("modal-location").value.trim();
    const profileImage = document.getElementById("modal-profileImage").value.trim();

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

      // עדכון ה־Topbar לאחר השמירה
      document.getElementById("current-user").textContent = data.user.username;
      document.getElementById("profile-img").src = `../images/users/${data.user.profileImage}.png`;

      // סגירת המודל
      const modalInstance = bootstrap.Modal.getInstance(profileModal);
      modalInstance.hide();
    } catch (err) {
      console.error("שגיאה בעדכון פרטי המשתמש:", err);
    }
  });

  // כפתור התנתקות
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/login.html";
  });

  // כפתור מחיקת משתמש
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

      alert("המשתמש נמחק בהצלחה.");
      localStorage.clear();
      window.location.href = "/login.html";
    } catch (err) {
      alert("שגיאה במחיקת המשתמש: " + err.message);
      console.error(err);
    }
  });
}

document.addEventListener("DOMContentLoaded", initTopbar);
