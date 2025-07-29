
function initSidebarRight() {
  localStorage.setItem("userId", "6877ab02f2212b55a0e18706");
  const userId = localStorage.getItem("userId");

  const addFriendBtn = document.getElementById("addFriendBtn");
  const searchSection = document.getElementById("friendSearchSection");
  const searchInput = document.getElementById("friendSearchInput");
  const searchResultsContainer = document.getElementById("searchResults");

  if (!addFriendBtn || !searchSection || !searchInput || !searchResultsContainer) {
    console.error("Sidebar elements not found");
    return;
  }

  addFriendBtn.addEventListener("click", () => {
    searchSection.style.display =
      searchSection.style.display === "none" ? "block" : "none";
    searchInput.value = "";
    searchResultsContainer.innerHTML = "";
  });

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();

    if (!query) {
      searchResultsContainer.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users?search=${query}`);
      const data = await res.json();

      const existingFriendIds = new Set([userId]);
      document
        .querySelectorAll("#friendsList .delete-btn")
        .forEach((btn) => existingFriendIds.add(btn.dataset.id));

      const filtered = data.filter((user) => !existingFriendIds.has(user._id));

      searchResultsContainer.innerHTML = "";

      if (filtered.length === 0) {
        searchResultsContainer.innerHTML =
          "<div class='text-muted small'>לא נמצאו משתמשים</div>";
        return;
      }

      filtered.forEach((user) => {
        const item = document.createElement("div");
        item.className =
          "list-group-item d-flex align-items-center justify-content-between";
        item.innerHTML = `
          <div class="d-flex align-items-center">
            <img src="${
              user.profileImage || "./images/default.jpg"
            }" class="avatar me-2" />
            <span>${user.username}</span>
          </div>
          <button class="btn btn-sm btn-success add-btn" data-id="${user._id}">הוסף</button>
        `;

        item.querySelector(".add-btn").addEventListener("click", async () => {
          try {
            const res = await fetch(
              `http://localhost:5000/api/users/${userId}/friend/${user._id}`,
              { method: "POST" }
            );
            if (res.ok) {
              await loadFriends();
              searchInput.value = "";
              searchResultsContainer.innerHTML =
                "<div class='text-success small'>נוסף בהצלחה</div>";
            } else {
              const r = await res.json();
              alert(r.message || "שגיאה בהוספה");
            }
          } catch (err) {
            console.error("Add friend error:", err);
          }
        });

        searchResultsContainer.appendChild(item);
      });
    } catch (err) {
      console.error("Search error:", err);
    }
  });

  loadFriends();
}

async function loadFriends() {
  const userId = localStorage.getItem("userId");
  const container = document.getElementById("friendsList");

  if (!container) {
    console.error("friendsList container not found!");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/users/${userId}/friends`
    );
    const data = await res.json();
    container.innerHTML = "";

    if (!data.friends || data.friends.length === 0) {
      container.innerHTML = '<p class="text-muted">אין חברים להצגה.</p>';
      return;
    }

    data.friends.forEach((friend) => {
      const div = document.createElement("div");
      div.className =
        "friend-item d-flex align-items-center justify-content-between p-2 mb-2 shadow-sm";

      div.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${
            friend.profileImage || "./images/default.jpg"
          }" class="avatar me-2" alt="${friend.username}" />
          <div class="friend-info fw-bold">${friend.username}</div>
        </div>
        <button class="btn btn-sm delete-btn" data-id="${
          friend._id
        }" title="הסר חבר">🗑️</button>
      `;

      container.appendChild(div);
    });

    container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const friendId = btn.dataset.id;

        try {
          const res = await fetch(
            `http://localhost:5000/api/users/${userId}/friend/${friendId}`,
            { method: "DELETE" }
          );

          if (res.ok) {
            await loadFriends();
          } else {
            const result = await res.json();
            alert(result.message || "שגיאה במחיקת חבר");
          }
        } catch (err) {
          console.error("Error removing friend:", err);
        }
      });
    });

  } catch (err) {
    console.error("Failed to load friends", err);
  }
}
