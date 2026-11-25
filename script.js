
// Demo student account menu (no real authentication).
const profileToggle = document.getElementById("profile-toggle");
const profileMenu = document.getElementById("profile-menu");

if (profileToggle && profileMenu) {
  profileToggle.addEventListener("click", () => {
    const isOpen = !profileMenu.hidden;
    profileMenu.hidden = isOpen;
    profileToggle.setAttribute("aria-expanded", String(!isOpen));
  });

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
const CURRENT_STUDENT = "Pratik S.";

const meetingPoints = [
  "Student Centre",
  "Library entrance",
  "Main lobby"
];

const meetingTimes = [
  "09:30",
  "10:30",
  "11:30",
  "12:30",
  "13:30",
  "14:30",
  "15:30",
  "16:30"
];

// Sample listings for Browse Items.
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

// Select a random value from a list.
function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Generate a dummy date between tomorrow and seven days from now.
function randomDate() {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Convert a saved date into a readable date.
function formatDate(dateString) {
  if (!dateString) return "Not selected";

  const date = new Date(dateString + "T00:00:00");

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

// Convert 24-hour time into AM/PM format.
function formatTime(timeString) {
  if (!timeString) return "Not selected";

  const parts = timeString.split(":");

  if (parts.length !== 2) return timeString;

  let hour = Number(parts[0]);
  const minute = parts[1];
  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
}

// Get and prepare all listings.
function getItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));

    // FIX: Use sample listings when browser storage is empty.
    const source = Array.isArray(saved) ? saved : initial;

    const missing = initial.filter(seed =>
      !source.some(item => Number(item.id) === seed.id)
    );

    const merged = [...source, ...missing].map(item => {
      const isSample = initial.some(
        seed => Number(seed.id) === Number(item.id)
      );

      const oldDate =
        !item.meetupDate ||
        item.meetupDate === "Arrange after request";

      const oldTime =
        !item.meetupTime ||
        item.meetupTime === "Contact the listing owner";

      const oldPickup =
        !item.pickup ||
        !meetingPoints.includes(item.pickup);

      return {
        ...item,

        owner: item.owner ||
          (isSample ? "Campus Pantry Student" : CURRENT_STUDENT),

        // Keep existing campus meeting points.
        pickup: oldPickup
          ? randomChoice(meetingPoints)
          : item.pickup,

        // Generate dummy dates for old sample listings.
        meetupDate: oldDate
          ? randomDate()
          : item.meetupDate,

        // Generate dummy times for old sample listings.
        meetupTime: oldTime
          ? randomChoice(meetingTimes)
          : item.meetupTime
      };
    });

    // Save generated details so they stay the same after refresh.
    saveItems(merged);

    return merged;

  } catch (error) {
    console.error("Error loading listings:", error);
    return initial;
  }
}

// Save listings.
function saveItems(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Could not save listings:", error);
  }
}

// Get requests.
function getRequests() {
  try {
    const value = JSON.parse(localStorage.getItem(REQUESTS_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

// Save requests.
function saveRequests(requests) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Could not save requests:", error);
  }
}

// Escape user-entered text before displaying it.
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

// Browse Items page.
const grid = document.getElementById("item-grid");

if (grid) {
  let items = getItems();
  let selected = null;

  const search = document.getElementById("search");
  const category = document.getElementById("category");
  const modal = document.getElementById("modal");
  const requestFeedback = document.getElementById("request-feedback");
  const requestButton = document.getElementById("request-button");

  const payItForwardMessage =
    document.getElementById("pay-it-forward-message");

  // Display available listings.
  function render() {
    const term = search.value.toLowerCase().trim();

    const shown = items.filter(item =>
      item.available &&
      item.name.toLowerCase().includes(term) &&
      (category.value === "All" || item.category === category.value)
    );

    grid.innerHTML = "";

    document.getElementById("empty-message").hidden =
      shown.length > 0;

    shown.forEach(item => {
      const card = document.createElement("article");

      card.className = "item";

      card.innerHTML = `
        <span class="pill">${esc(item.category)}</span>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.condition)}</p>

        <small>
          Listed by: ${esc(item.owner)}
        </small>

        <small>
          Meeting point: ${esc(item.pickup)}
        </small>

        <small>
          Meetup: ${esc(formatDate(item.meetupDate))}
          · ${esc(formatTime(item.meetupTime))}
        </small>

        <button class="btn" data-id="${item.id}">
          View details
        </button>
      `;

      grid.appendChild(card);
    });
  }

  // Open item details.
  grid.addEventListener("click", event => {
    const button = event.target.closest("button[data-id]");

    if (!button) return;

    const item = items.find(entry =>
      Number(entry.id) === Number(button.dataset.id)
    );

    if (!item) return;

    selected = item.id;

    document.getElementById("modal-title").textContent = item.name;
    document.getElementById("modal-category").textContent = item.category;
    document.getElementById("modal-condition").textContent = item.condition;

    document.getElementById("modal-pickup").textContent = item.pickup;

    document.getElementById("modal-owner").textContent =
      item.owner || "Campus Pantry Student";

    document.getElementById("modal-meetup").textContent =
      `${formatDate(item.meetupDate)} · ${formatTime(item.meetupTime)}`;

    requestFeedback.textContent = "";

    if (payItForwardMessage) {
      payItForwardMessage.hidden = true;
    }

    requestButton.disabled = false;
    requestButton.textContent = "Request item";

    modal.hidden = false;
  });

  // Request an item.
  requestButton.addEventListener("click", () => {
    const item = items.find(entry =>
      Number(entry.id) === Number(selected)
    );

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
      owner: item.owner,
      meetupDate: item.meetupDate,
      meetupTime: item.meetupTime,
      date: new Date().toLocaleString(),
      status: "Requested"
    });

    saveRequests(requests);

    render();

    requestFeedback.textContent =
      "Your request has been saved. You can see it on the My Requests page.";

    if (payItForwardMessage) {
      payItForwardMessage.hidden = false;
    }

    requestButton.textContent = "Requested";
    requestButton.disabled = true;
  });

  // Close item details.
  function closeModal() {
    modal.hidden = true;
  }

  document.getElementById("close-modal")
    .addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
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

// Give an Item page.
const form = document.getElementById("give-form");

if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const items = getItems();

    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value;
    const condition = document.getElementById("item-condition").value.trim();

    // The selected campus meeting point is saved as pickup.
    const pickup = document.getElementById("pickup").value;

    const meetupDate = document.getElementById("meetup-date").value;
    const meetupTime = document.getElementById("meetup-time").value;

    if (
      !name ||
      !category ||
      !condition ||
      !pickup ||
      !meetupDate ||
      !meetupTime
    ) {
      return;
    }

    items.unshift({
      id: Date.now(),
      name,
      category,
      condition,
      pickup,
      owner: CURRENT_STUDENT,
      meetupDate,
      meetupTime,
      available: true,
      listingStatus: "Available"
    });

    saveItems(items);

    form.reset();

    document.getElementById("give-feedback").textContent =
      "Thanks! Your item has been added.";
  });
}

// My Requests page.
const requestsList = document.getElementById("requests-list");

if (requestsList) {
  function renderRequests() {
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

        <p>Meeting point: ${esc(request.pickup)}</p>

        <p>
          Meetup:
          ${esc(formatDate(request.meetupDate))}
          · ${esc(formatTime(request.meetupTime))}
        </p>

        <p>Requested: ${esc(request.date)}</p>

        <button
          class="btn cancel-request"
          data-request-id="${request.id}">
          Cancel request
        </button>
      `;

      requestsList.appendChild(card);
    });
  }

  // Cancel a request.
  requestsList.addEventListener("click", event => {
    const button = event.target.closest("button[data-request-id]");

    if (!button) return;

    const requestId = Number(button.dataset.requestId);
    const requests = getRequests();

    const request = requests.find(
      entry => Number(entry.id) === requestId
    );

    if (!request || request.status !== "Requested") return;

    saveRequests(
      requests.filter(entry => Number(entry.id) !== requestId)
    );

    // Make the item available again.
    const items = getItems();

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

// My Listings page.
const myListings = document.getElementById("my-listings");

if (myListings) {
  function renderMyListings() {
    const ownItems = getItems().filter(
      item => item.owner === CURRENT_STUDENT
    );

    myListings.innerHTML = "";

    document.getElementById("no-listings").hidden =
      ownItems.length > 0;

    ownItems.forEach(item => {
      const card = document.createElement("article");

      card.className = "item";

      const status = item.available ? "Available" : "Requested";

      card.innerHTML = `
        <span class="pill">${esc(item.category)}</span>

        <h3>${esc(item.name)}</h3>

        <p>${esc(item.condition)}</p>

        <p>Meeting point: ${esc(item.pickup)}</p>

        <p>
          Meetup:
          ${esc(formatDate(item.meetupDate))}
          · ${esc(formatTime(item.meetupTime))}
        </p>

        <p>Listed by: ${esc(item.owner)}</p>

        <strong class="listing-status">${status}</strong>

        ${
          item.available
            ? `<button class="btn cancel-listing" data-item-id="${item.id}">
                 Cancel listing
               </button>`
            : `<p class="sub">
                 This item has already been requested and is no longer available to cancel.
               </p>`
        }
      `;

      myListings.appendChild(card);
    });
  }

  // Cancel one of your own available listings.
  myListings.addEventListener("click", event => {
    const button = event.target.closest("button[data-item-id]");

    if (!button) return;

    const itemId = Number(button.dataset.itemId);
    const items = getItems();

    const item = items.find(entry =>
      Number(entry.id) === itemId &&
      entry.owner === CURRENT_STUDENT
    );

    if (!item || !item.available) return;

    if (!confirm(`Cancel your listing for "${item.name}"?`)) {
      return;
    }

    saveItems(
      items.filter(entry => Number(entry.id) !== itemId)
    );

    renderMyListings();
  });

  renderMyListings();
}
