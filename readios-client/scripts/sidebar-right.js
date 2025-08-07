
function initSidebarRight() {
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
          <img src="${`../images/users/${user.profileImage}.png`}" class="avatar me-2" />
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
              searchResultsContainer.innerHTML = `<div class='text-success small'>החבר ${user.username} נוסף בהצלחה</div>`;
              setTimeout(() => {
                searchResultsContainer.innerHTML = "";
              }, 3000);
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

  // Google Books API
  const bookInput = document.getElementById("bookSearchInput");
  const bookResults = document.getElementById("bookSearchResults");

  let currentRequestId = 0;

  bookInput.addEventListener("input", async () => {
    const query = bookInput.value.trim();
    bookResults.innerHTML = "";

    if (!query) return;

    const thisRequestId = ++currentRequestId;

    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&maxResults=10`);
      const data = await res.json();

      if (thisRequestId !== currentRequestId) return;

      if (!data.items || data.items.length === 0) {
        bookResults.innerHTML = "<div class='text-muted small'>לא נמצאו ספרים</div>";
        return;
      }

      data.items.slice(0, 10).forEach(book => {
        const info = book.volumeInfo;
        const item = document.createElement("div");
        item.className = "list-group-item";

        item.innerHTML = `
          <div class="d-flex">
            <img src="${info.imageLinks?.thumbnail || ''}" class="book-thumb me-2" />
            <div>
              <div><strong>${info.title}</strong></div>
              <div class="small">${info.authors?.join(", ") || "לא ידוע"}</div>
              <div class="small text-muted">${info.publishedDate || ""}</div>
            </div>
          </div>
        `;
        bookResults.appendChild(item);
      });

    } catch (err) {
      console.error("Book API error:", err);
      bookResults.innerHTML = "<div class='text-danger small'>שגיאה בחיפוש</div>";
    }
  });
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
          <img src="../images/users/${friend.profileImage}.png" class="avatar me-2" alt="${friend.username}" />
          <div class="friend-info fw-bold">${friend.username}</div>
        </div>
        <button class="btn p-0 text-danger ms-2 delete-btn" data-id="${friend._id}" title="הסר חבר">
          <i class="bi bi-trash-fill fs-5"></i>
        </button>
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

async function initMap() {
  console.log("🔵 initMap מופעל");

  const map = new google.maps.Map(document.getElementById("user-map"), {
    center: { lat: 31.771959, lng: 35.217018 }, // מרכז ישראל
    zoom: 7
  });

  try {
    const res = await fetch("http://localhost:5000/api/users");
    const users = await res.json();

    for (const user of users) {
      if (user.location) {
        const coords = await getLatLngFromCity(user.location);
        if (coords) {
          new google.maps.Marker({
            position: coords,
            map,
            title: user.username
          });
        }
      }
    }
  } catch (err) {
    console.error("שגיאה בטעינת מיקומי משתמשים:", err);
  }
};


// פונקציה שממירה שם עיר לקואורדינטות
async function getLatLngFromCity(cityName) {
  const apiKey = 'AIzaSyBIlmXXvuUYx3vxsddpHZw22G2CQLeAAlQ'; // אותו מפתח כמו במפה
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}, Israel&key=${apiKey}`);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  }
  return null;
}
