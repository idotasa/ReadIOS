function initSidebarLeft() {
  const userId = localStorage.getItem("userId");

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
      const pageId = '743738418818975';
      const accessToken = 'EAAKSqr1wd4ABPAXZBMZCcnMraP9KmxT0x7a8SG2LkEyNF44pKgvf2mKxRPRiPHBPhw0DbPUPc2zVptcqOWG4nKlCRC0947JEychDKUmEZBUWCbU0TfBZAZCBha7XqOtUbVFyclZAwWumS8cbZANGAHaeCU8u9QX46hXWtME7qoZAUgpFU1DMPgIZBezVcn57epJKdggDEevEbY0PWc5WaCJdqzkUKrSLsfrjAdPJKyZCuJIHUZD'; // Page Access Token המלא שקיבלת

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
      message += `\n${index + 1}.${post.userName} - ${post.title}`;
    });

    const params = new URLSearchParams();
    params.append('message', message);
    params.append('access_token', accessToken);

    const fbRes = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const fbData = await fbRes.json();

    if (fbRes.ok) {
      const toastEl = document.getElementById('facebookToast');
      const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
      toast.show();

    } else {
      alert('שגיאה בפרסום לפייסבוק: ' + (fbData.error.message || 'שגיאה לא ידועה'));
    }
  } catch (err) {
    alert('שגיאה כללית: ' + err.message);
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
