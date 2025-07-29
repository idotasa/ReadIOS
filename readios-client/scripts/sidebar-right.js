localStorage.setItem("userId", "6877ab02f2212b55a0e18706");

document.addEventListener("DOMContentLoaded", () => {
  loadFriends();
});

async function loadFriends() {
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}/friends`);
    const data = await res.json();
    const container = document.getElementById("friendsList");
    container.innerHTML = '';

    if (data.friends.length === 0) {
      container.innerHTML = '<p class="text-muted">אין חברים להצגה.</p>';
      return;
    }

    data.friends.forEach(friend => {
      const div = document.createElement("div");
      div.className = "friend-item d-flex align-items-center justify-content-between p-2 mb-2 shadow-sm";

      div.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${friend.profileImage || './images/default.jpg'}" class="avatar me-2" alt="${friend.username}" />
          <div class="friend-info fw-bold">${friend.username}</div>
        </div>
        <button class="btn btn-sm btn-link text-danger delete-btn" data-id="${friend.id}" title="הסר חבר">🗑️</button>
      `;

      container.appendChild(div);
    });

    container.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const friendId = e.currentTarget.getAttribute("data-id");

        try {
          const res = await fetch(`http://localhost:5000/api/users/${userId}/friend/${friendId}`, {
            method: "DELETE"
          });

          if (res.ok) {
            loadFriends(); // reload list
          } else {
            const result = await res.json();
            alert(result.message || "שגיאה במחיקה");
          }
        } catch (err) {
          console.error("שגיאה במחיקה:", err);
        }
      });
    });

  } catch (err) {
    console.error("שגיאה בטעינת חברים", err);
  }
}
