localStorage.setItem("userId", "6877ab02f2212b55a0e18706");
// localStorage.setItem("userId", "6877acca8b328f4e441b87ec");
localStorage.setItem("userName", "851idot");

async function initTopbar() {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  // check if user is already logged in
  if (!userId || !userName) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}`);
    if (!res.ok) {
      throw new Error(`Invalid userId: ${res.status} ${res.statusText}`);
    }

    const user = await res.json();

    const usernameElement = document.getElementById("current-user");
    const profileImageElement = document.getElementById("profile-img");

    if (usernameElement) {
      usernameElement.textContent = user.username;
    }

    if (profileImageElement) {
      profileImageElement.src = `../images/users/${user.profileImage}.png`;
      profileImageElement.alt = `${user.username} profile image`;
    }

  } catch (error) {
    console.error("אירעה שגיאה בהבאת נתוני המשתמש:", error);
    window.location.href = "/login.html";
  }
}
