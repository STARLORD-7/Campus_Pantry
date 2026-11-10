
// Demo student account menu (the prototype does not use real authentication).
const profileToggle = document.getElementById("profile-toggle");
const profileMenu = document.getElementById("profile-menu");

if (profileToggle && profileMenu) {
  profileToggle.addEventListener("click", () => {
    const isOpen = !profileMenu.hidden;

    profileMenu.hidden = isOpen;
    profileToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  // Close the menu when clicking somewhere outside it.
  document.addEventListener("click", event => {
    if (!event.target.closest(".profile-wrap")) {
      profileMenu.hidden = true;
      profileToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.getElementById("sign-out")?.addEventListener("click", () => {
    profileMenu.querySelector(".login-status").innerHTML =
        "<span></span> Signed out (demo)";

    profileMenu.querySelector(".profile-heading small").textContent =
        "Guest account";

    profileToggle.querySelector(".avatar-letter").textContent = "G";
    profileToggle.querySelector(".online-dot").style.background = "#aaa";
  });
}

const KEY = "campusPantrySimpleItems";
const REQUESTS_KEY = "campusPantryRequests";

// Sample listings for the Browse page.
const initial = [
  {
    id: 1,
    name: "Notebook",
    category: "School supplies",
    condition: "Good condition",
    pickup: "Student Centre",
    available: true
  },
  {
    id: 2,
    name: "Pasta (unopened)",
    category: "Food",
    condition: "Unopened package",
    pickup: "Library entrance",
    available: true
  },
  {
    id: 3,
    name: "Winter scarf",
    category: "Household",
    condition: "Clean and gently used",
    pickup: "Student Centre",
    available: true
  },
  {
    id: 4,
    name: "Travel-size shampoo",
    category: "Personal care",
    condition: "New and unopened",
    pickup: "Library entrance",
    available: true
  },
  {
    id: 5,
    name: "Biology textbook",
    category: "School supplies",
    condition: "Used, readable condition",
    pickup: "Main lobby",
    available: true
  },
  {
    id: 6,
    name: "Reusable water bottle",
    category: "Household",
    condition: "Clean and in good condition",
    pickup: "Student Centre",
    available: true
  },
  {
    id: 7,
    name: "Instant oatmeal (unopened)",
    category: "Food",
    condition: "Unopened package",
    pickup: "Library entrance",
    available: true
  },
  {
    id: 8,
    name: "Pens and highlighters",
    category: "School supplies",
    condition: "Good condition",
    pickup: "Main lobby",
    available: true
  },
  {
    id: 9,
    name: "Scientific calculator",
    category: "School supplies",
    condition: "Works properly, gently used",
    pickup: "Student Centre",
    available: true
  },
  {
    id: 10,
    name: "Granola bars (unopened)",
    category: "Food",
    condition: "Sealed package",
    pickup: "Library entrance",
    available: true
  },
  {
    id: 11,
    name: "Reusable lunch container",
    category: "Household",
    condition: "Clean and in good condition",
    pickup: "Main lobby",
    available: true
  },
  {
    id: 12,
    name: "Warm winter gloves",
    category: "Household",
    condition: "Clean and gently used",
    pickup: "Student Centre",
    available: true
  }
];

function getItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));

    if (!Array.isArray(saved)) return initial;

    // Add new demo listings without overwriting existing changes.
    const missing = initial.filter(seed =>
        !saved.some(item => Number(item.id) === seed.id)
    );

    const merged = [...saved, ...missing];

    if (missing.length) {
      saveItems(merged);
    }

    return merged;
  } catch {
    return initial;
  }
}

function saveItems(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

function getRequests() {
  try {
    const value = JSON.parse(localStorage.getItem(REQUESTS_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveRequests(requests) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch {}
}

// Escape user-entered text before displaying it in HTML.
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

// Browse page
const grid = document.getElementById("item-grid");

if (grid) {
  let items = getItems();
  let selected = null;

  const search = document.getElementById("search");
  const category = document.getElementById("category");

  function render() {
    const term = search.value.toLowerCase().trim();

    const shown = items.filter(item =>
        item.available &&
        item.name.toLowerCase().includes(term) &&
        (category.value === "All" || item.category === category.value)
    );

    grid.innerHTML = "";
    document.getElementById("empty-message").hidden = shown.length > 0;

    shown.forEach(item => {
      const card = document.createElement("article");

      card.className = "item";

      card.innerHTML = `
                <span class="pill">${esc(item.category)}</span>
                <h3>${esc(item.name)}</h3>
                <p>${esc(item.condition)}</p>
                <small>Pickup: ${esc(item.pickup)}</small>
                <button class="btn" data-id="${item.id}">
                    View details
                </button>
            `;

      grid.appendChild(card);
    });
  }

  grid.addEventListener("click", event => {
    const button = event.target.closest("button[data-id]");

    if (!button) return;

    const item = items.find(entry =>
        entry.id === Number(button.dataset.id)
    );

    if (!item) return;

    selected = item.id;

    document.getElementById("modal-title").textContent = item.name;
    document.getElementById("modal-category").textContent = item.category;
    document.getElementById("modal-condition").textContent = item.condition;
    document.getElementById("modal-pickup").textContent = item.pickup;
    document.getElementById("request-feedback").textContent = "";

    const requestButton = document.getElementById("request-button");

    requestButton.disabled = false;
    requestButton.textContent = "Request item";

    document.getElementById("modal").hidden = false;
  });

  // Save the request and remove the item from Browse.
  document.getElementById("request-button").addEventListener("click", () => {
    const item = items.find(entry => entry.id === selected);

    if (!item || !item.available) return;

    item.available = false;
    saveItems(items);

    const requests = getRequests();

    requests.unshift({
      id: Date.now(),
      itemId: item.id,
      name: item.name,
      category: item.category,
      condition: item.condition,
      pickup: item.pickup,
      date: new Date().toLocaleString(),
      status: "Requested"
    });

    saveRequests(requests);
    render();

    document.getElementById("request-feedback").textContent =
        "Request saved! You can see it on the My Requests page.";

    const button = document.getElementById("request-button");

    button.textContent = "Requested";
    button.disabled = true;
  });

  function closeModal() {
    document.getElementById("modal").hidden = true;
  }

  document.getElementById("close-modal").addEventListener("click", closeModal);

  document.getElementById("modal").addEventListener("click", event => {
    if (event.target.id === "modal") {
      closeModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  search.addEventListener("input", render);
  category.addEventListener("change", render);

  render();
}

// Give an item page
const form = document.getElementById("give-form");

if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const items = getItems();

    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value;
    const condition = document.getElementById("item-condition").value.trim();
    const pickup = document.getElementById("pickup").value.trim();

    if (!name || !category || !condition || !pickup) return;

    items.unshift({
      id: Date.now(),
      name,
      category,
      condition,
      pickup,
      available: true
    });

    saveItems(items);
    form.reset();

    document.getElementById("give-feedback").textContent =
        "Thanks! Your item has been added.";
  });
}

// My Requests page
const requestsList = document.getElementById("requests-list");

if (requestsList) {
  function renderRequests() {
    // Only active requests appear on this page.
    const requests = getRequests().filter(
        request => request.status === "Requested"
    );

    saveRequests(requests);

    requestsList.innerHTML = "";

    document.getElementById("no-requests").hidden =
        requests.length > 0;

    requests.forEach(request => {
      const card = document.createElement("article");

      card.className = "request-card";

      card.innerHTML = `
                <span class="request-status">Requested</span>
                <h3>${esc(request.name)}</h3>
                <p>Category: ${esc(request.category)}</p>
                <p>Pickup spot: ${esc(request.pickup)}</p>
                <p>Requested: ${esc(request.date)}</p>
                <button class="btn cancel-request" data-request-id="${request.id}">
                    Cancel request
                </button>
            `;

      requestsList.appendChild(card);
    });
  }

  requestsList.addEventListener("click", event => {
    const button = event.target.closest("button[data-request-id]");

    if (!button) return;

    const requestId = Number(button.dataset.requestId);
    const requests = getRequests();

    const request = requests.find(
        entry => Number(entry.id) === requestId
    );

    if (!request || request.status !== "Requested") return;

    // Remove the cancelled request completely from My Requests.
    saveRequests(
        requests.filter(entry => Number(entry.id) !== requestId)
    );

    const items = getItems();

    // itemId is used for new requests, with a name fallback for older ones.
    const item = items.find(entry =>
        request.itemId != null
            ? Number(entry.id) === Number(request.itemId)
            : entry.name === request.name
    );

    if (item) {
      item.available = true;
      saveItems(items);
    }

    renderRequests();
  });

  renderRequests();
}
