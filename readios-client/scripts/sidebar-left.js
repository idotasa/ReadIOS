function initSidebarLeft() {
  const userId = localStorage.getItem("userId");
  console.log("📥 initSidebarLeft loaded")
  const addGroupBtn = document.getElementById("addGroupBtn");
  const groupSearchSection = document.getElementById("groupSearchSection");
  const groupSearchInput = document.getElementById("groupSearchInput");
  const groupResultsContainer = document.getElementById("groupSearchResults");

  const openModalBtn = document.getElementById("openCreateGroupModal");
  const createGroupModal = document.getElementById("createGroupModal");
  const cancelCreateGroupBtn = document.getElementById("cancelCreateGroupBtn");
  const createGroupForm = document.getElementById("createGroupForm");

  openModalBtn.addEventListener("click", () => {
    createGroupModal.classList.remove("hidden");
  });

  cancelCreateGroupBtn.addEventListener("click", () => {
    createGroupModal.classList.add("hidden");
    createGroupForm.reset();
    resetImageSelection();
  });

  createGroupModal.addEventListener("click", (e) => {
    if (e.target === createGroupModal) {
      createGroupModal.classList.add("hidden");
      createGroupForm.reset();
      resetImageSelection();
    }
  });

  document.querySelectorAll(".group-image-option").forEach(img => {
    img.addEventListener("click", () => {
      document.querySelectorAll(".group-image-option").forEach(i => i.classList.remove("selected"));
      img.classList.add("selected");
      document.getElementById("groupImageInput").value = img.dataset.value;
    });
  });

  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("groupNameInput").value.trim();
    const description = document.getElementById("groupDescriptionInput").value.trim();
    const groupImage = document.getElementById("groupImageInput").value;

    try {
      const res = await fetch("http://localhost:5000/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, groupImage, userId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "שגיאה ביצירת קבוצה");
      }

      const newGroup = await res.json();

      createGroupModal.classList.add("hidden");
      createGroupForm.reset();
      resetImageSelection();
      await loadGroups();
    } catch (err) {
      alert(`שגיאה: ${err.message}`);
      console.error(err);
    }
  });
  

  function resetImageSelection() {
    document.querySelectorAll(".group-image-option").forEach(i => i.classList.remove("selected"));
    const first = document.querySelector(".group-image-option[data-value='group1']");
    if (first) first.classList.add("selected");
    document.getElementById("groupImageInput").value = "group1";
  }

  addGroupBtn.addEventListener("click", () => {
    groupSearchSection.style.display =
      groupSearchSection.style.display === "none" ? "block" : "none";
    groupSearchInput.value = "";
    groupResultsContainer.innerHTML = "";
  });

  groupSearchInput.addEventListener("input", async () => {
    const query = groupSearchInput.value.trim();
    if (!query) {
      groupResultsContainer.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/groups?search=${query}`);
      const data = await res.json();

      const currentGroupIds = [
        ...document.querySelectorAll("#groupsList .group-item")
      ].map(div => div.dataset.id);

      const filtered = data.filter(group => !currentGroupIds.includes(group._id));

      groupResultsContainer.innerHTML = "";

      if (filtered.length === 0) {
        groupResultsContainer.innerHTML = "<div class='text-muted small'>לא נמצאו קבוצות</div>";
        return;
      }

      filtered.forEach(group => {
        const item = document.createElement("div");
        item.className = "list-group-item d-flex align-items-center justify-content-between";
        item.innerHTML = `
          <div class="d-flex align-items-center">
            <img src="../images/groups/${group.groupImage || 'group1'}.png" class="avatar me-2" />
            <span>${group.name}</span>
          </div>
          <button class="btn btn-sm btn-success" data-id="${group._id}">הצטרף</button>
        `;

        item.querySelector("button").addEventListener("click", async () => {
          try {
            const res = await fetch(`http://localhost:5000/api/groups/${group._id}/members/${userId}`, {
              method: "POST"
            });

            if (res.ok) {
              await loadGroups();
              groupSearchInput.value = "";
              groupResultsContainer.innerHTML = `<div class='text-success small'>נוספת לקבוצה "${group.name}"</div>`;
              setTimeout(() => {
                groupResultsContainer.innerHTML = "";
              }, 3000);
            } else {
              const r = await res.json();
              alert(r.message || r.error || "שגיאה בהצטרפות");
            }
          } catch (err) {
            console.error("Join group error:", err);
          }
        });

        groupResultsContainer.appendChild(item);
      });
    } catch (err) {
      console.error("Group search error:", err);
    }
  });

  loadGroups();
  renderPostsByGroupChart();
  renderPostTypesPieChart();
}

async function loadGroups() {
  const userId = localStorage.getItem("userId");
  const container = document.getElementById("groupsList");

  if (!container) {
    console.error("groupsList container not found!");
    return;
  }

try {
  const res = await fetch(`http://localhost:5000/api/users/${userId}/groupPreviews`);
  const data = await res.json();

  container.innerHTML = "";

  if (!data.groups || data.groups.length === 0) {
    container.innerHTML = '<p class="text-muted">אין קבוצות להצגה.</p>';
    return;
  }

  data.groups.forEach(group => {
    const div = document.createElement("div");
    div.className = "group-item d-flex align-items-center mb-2 justify-content-between";
    div.dataset.id = group._id;

    const groupInfo = document.createElement("div");
    groupInfo.className = "d-flex align-items-center group-click";
    groupInfo.style.cursor = "pointer";

    groupInfo.innerHTML = `
      <img src="../images/groups/${group.groupImage}.png" class="avatar me-2" />
      <span class="fw-bold">${group.name}</span>
    `;

    groupInfo.addEventListener("click", () => {
      window.location.href = `/groups/${group._id}`;
    });

    let actionBtn;
    
  if (group.isAdmin) {
    actionBtn = document.createElement("button");
    actionBtn.className = "btn p-0 ms-2 text-primary";
    actionBtn.innerHTML = '<i class="bi bi-megaphone-fill fs-6"></i>';
    actionBtn.title = "שתף סיכום יומי לפייסבוק";

    actionBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        try {
          const summaryRes = await fetch(`http://localhost:5000/api/groups/today/${group._id}`);
          const posts = await summaryRes.json();

          if (!Array.isArray(posts) || posts.length === 0) {
              alert("לא נמצאו פוסטים לשיתוף היום");
              return;
          }

          const groupDescription = posts[0]?.description || "";
          let message = `📝 סיכום יומי של הקבוצה "${group.name}"\n\n`;
          message += `📃 תיאור הקבוצה: ${groupDescription}\n\n`;
          message += `📌 פוסטים שנכתבו היום:\n`;

          posts.forEach((post, index) => {
              message += `\n${index + 1}. ${post.userName} - ${post.title}`;
          });

          const shareRes = await fetch(`http://localhost:5000/api/groups/${group._id}/share-to-facebook`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: message }),
          });

          const shareData = await shareRes.json();

          if (shareRes.ok) {
              const toastEl = document.getElementById('facebookToast');
              const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
              toast.show();
          } else {
              alert('שגיאה בפרסום לפייסבוק: ' + (shareData.error || 'שגיאה לא ידועה'));
          }
        } catch (err) {
            alert('שגיאה כללית: ' + err.message);
            console.error("שגיאה כללית בפרונטאנד:", err);
        }
    });
  } else {
      actionBtn = document.createElement("button");
      actionBtn.className = "btn p-0 ms-2 text-danger";
      actionBtn.innerHTML = '<i class="bi bi-door-open-fill fs-5"></i>';
      actionBtn.title = "עזוב קבוצה";

      actionBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        try {
          const res = await fetch(`http://localhost:5000/api/groups/${group._id}/members/${userId}`, {
            method: "DELETE"
          });

          if (res.ok) {
            await loadGroups();
          } else {
            const r = await res.json();
            alert(r.message || r.error || "שגיאה בעזיבת קבוצה");
          }
        } catch (err) {
          console.error("Error leaving group:", err);
        }
      });
    }

    div.appendChild(groupInfo);
    div.appendChild(actionBtn);
    container.appendChild(div);
  });
} catch (err) {
  console.error("Failed to load groups", err);
}

}
async function fetchPostsByGroupToday() {
  try {
    const res = await fetch('/api/groups/stats/postsByGroupToday');
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('❌ Error fetching postsByGroupToday:', err);
    return [];
  }
}

async function renderPostsByGroupChart() {
  const canvas = document.getElementById('postsByGroupChart');
  if (!canvas) {
    console.warn('📉 postsByGroupChart canvas not found');
    return;
  }

  console.log('📊 Rendering postsByGroupChart...');
  const stats = await fetchPostsByGroupToday();
  if (!stats || stats.length === 0) {
    console.warn('📉 No data for postsByGroupChart');
    return;
  }

  const labels = stats.map(g => g.groupName);
  const data = stats.map(g => g.postCount);

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'פוסטים שפורסמו היום',
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

async function fetchPostTypeStats() {
  try {
    const res = await fetch('/api/posts/stats/byType');
    if (!res.ok) throw new Error('שגיאה בשליפת נתוני סוגי פוסטים');
    return await res.json();
  } catch (err) {
    console.error('❌ fetchPostTypeStats:', err);
    return [];
  }
}

async function renderPostTypesPieChart() {
  const canvas = document.getElementById('postTypesPieChart');
  if (!canvas) {
    console.warn('⚠️ postTypesPieChart canvas not found');
    return;
  }

  const stats = await fetchPostTypeStats();
  if (!stats || stats.length === 0) {
    console.warn('⚠️ אין נתונים לגרף סוגי פוסטים');
    return;
  }

  const labels = stats.map(item => item.type);
  const data = stats.map(item => item.count);

  new Chart(canvas.getContext('2d'), {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'
        ],
        borderColor: 'white',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

