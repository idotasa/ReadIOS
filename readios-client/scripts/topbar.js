async function initTopbar() {
  console.log("✅ initTopbar התחיל לפעול");
  const userId = localStorage.getItem("userId");
  if (!userId || userId.length !== 24) {
  console.warn("⚠️ userId לא תקין:", userId);
  localStorage.removeItem("userId");
  window.location.href = "/login";
  return;
  }
  
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

  const resultsContainer = document.getElementById("topbar-search-results");


  document.addEventListener("click", (e) => {
    if (!resultsContainer.contains(e.target) && !e.target.closest("#searchModal") && !e.target.closest("#searchBtn")) {
      resultsContainer.style.display = "none";
    }
  });


  const searchModal = document.getElementById("searchModal");

searchModal.addEventListener("shown.bs.modal", () => {
  const searchBtn = document.getElementById("searchBtn");
  if (!searchBtn.dataset.connected) {
    searchBtn.addEventListener("click", async () => {
      console.log("🔍 כפתור חיפוש נלחץ");

      const resultsContainer = document.getElementById("topbar-search-results");
      const searchType = document.getElementById("search-type").value;
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "block";

      let foundResults = false;

      if (searchType === "user") {
        const username = document.getElementById("search-username").value;
        const location = document.getElementById("search-location").value;
        const isFriend = document.getElementById("search-isFriend").checked;

        try {
          const userParams = new URLSearchParams();
          if (username) userParams.append("search", username);
          if (location) userParams.append("location", location);
          if (isFriend) {
                          userParams.append("isFriend", "true");
                          userParams.append("userId", userId); // ✅ הוספה קריטית!
                        }

          console.log("🔍 מחפש משתמשים:", userParams.toString());

          const res = await fetch(`http://localhost:5000/api/users?${userParams}`);
          const users = await res.json();

          if (users.length > 0) {
            foundResults = true;
            users.forEach(user => {
              const li = document.createElement("li");
              li.className = "list-group-item p-0";
              li.innerHTML = `
                <div class="d-flex align-items-center gap-2 p-2">
                  <img src="../images/users/${user.profileImage || 'default'}.png" width="32" height="32" class="rounded-circle">
                  <div>
                    <div class="fw-bold">${user.username}</div>
                    <small>${user.location || 'מיקום לא צוין'}</small>
                  </div>
                </div>`;
              resultsContainer.appendChild(li);
            });
          }
        } catch (err) {
          console.error("שגיאה בחיפוש משתמשים:", err);
        }
      }

      if (searchType === "group") {
        const groupName = document.getElementById("search-groupName").value.trim();
        const groupUser = document.getElementById("search-groupUser").value.trim();
        const postToday = document.getElementById("search-group-postToday").checked;

        try {
          const groupParams = new URLSearchParams();
          if (groupName) groupParams.append("search", groupName);
          if (groupUser) {
                            groupParams.append("hasUserId", groupUser);
                          } else {
                            groupParams.append("hasUserId", userId); 
                          }

          const endpoint = postToday ? "searchWithPostsToday" : "";
          const fullUrl = `http://localhost:5000/api/groups/${endpoint}?${groupParams}`;

          console.log("🔍 מחפש קבוצות:", fullUrl);

          const resGroups = await fetch(fullUrl);
          const groups = await resGroups.json();

          if (groups.length > 0) {
            foundResults = true;
            groups.forEach(group => {
              const li = document.createElement("li");
              li.className = "list-group-item p-0";
              li.innerHTML = `
                <a href="groups/id=${group._id}" class="d-flex flex-column align-items-start p-2 text-decoration-none text-dark">
                  <div class="fw-bold">${group.name}</div>
                  <small>${group.description || 'ללא תיאור'}</small>
                </a>`;
              resultsContainer.appendChild(li);
            });
          } else {
            resultsContainer.innerHTML = `<li class="list-group-item text-center text-muted">❌ לא נמצאו קבוצות תואמות</li>`;
          }
        } catch (err) {
          console.error("שגיאה בחיפוש קבוצות:", err);
        }
      }

      if (!foundResults && resultsContainer.innerHTML.trim() === "") {
        resultsContainer.innerHTML = `<li class="list-group-item text-center text-muted">❌ לא נמצאו תוצאות</li>`;
      }

      const modalInstance = bootstrap.Modal.getInstance(document.getElementById("searchModal"));
      if (modalInstance) modalInstance.hide();
    });

    searchBtn.dataset.connected = "true";
  }
});


  const searchTypeSelect = document.getElementById("search-type");
  const userFields = document.getElementById("user-search-fields");
  const groupFields = document.getElementById("group-search-fields");

  if (searchTypeSelect && userFields && groupFields) {
    searchTypeSelect.addEventListener("change", () => {
      if (searchTypeSelect.value === "user") {
        userFields.classList.remove("d-none");
        groupFields.classList.add("d-none");
      } else {
        groupFields.classList.remove("d-none");
        userFields.classList.add("d-none");
      }
    });

    searchTypeSelect.dispatchEvent(new Event("change"));
  }
  

}

document.addEventListener("DOMContentLoaded", initTopbar);


