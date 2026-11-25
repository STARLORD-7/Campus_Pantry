
const KEY = "campusPantrySimpleItems";
const REQUESTS_KEY = "campusPantryRequests";
const CURRENT_STUDENT = "Pratik S.";

const meetingPoints = [
  "Student Centre",
  "Library entrance",
  "Main lobby"
];

const meetingTimes = [
  "09:30", "10:30", "11:30", "12:30",
  "13:30", "14:30", "15:30", "16:30"
];

const weekdays = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday"
];

// PROFILE MENU
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

// DEMO LISTINGS
const initial = [
  { id: 1, name: "Notebook", category: "School supplies", condition: "Good condition", pickup: "Student Centre", available: true },
  { id: 2, name: "Pasta (unopened)", category: "Food", condition: "Unopened package", pickup: "Library entrance", available: true },
  { id: 3, name: "Winter scarf", category: "Household", condition: "Clean and gently used", pickup: "Student Centre", available: true },
  { id: 4, name: "Travel-size shampoo", category: "Personal care", condition: "New and unopened", pickup: "Library entrance", available: true },
  { id: 5, name: "Biology textbook", category: "School supplies", condition: "Used, readable condition", pickup: "Main lobby", available: true },
  { id: 6, name: "Reusable water bottle", category: "Household", condition: "Clean and in good condition", pickup: "Student Centre", available: true },
  { id: 7, name: "Instant oatmeal (unopened)", category: "Food", condition: "Unopened package", pickup: "Library entrance", available: true },
  { id: 8, name: "Pens and highlighters", category: "School supplies", condition: "Good condition", pickup: "Main lobby", available: true },
  { id: 9, name: "Scientific calculator", category: "School supplies", condition: "Works properly, gently used", pickup: "Student Centre", available: true },
  { id: 10, name: "Granola bars (unopened)", category: "Food", condition: "Sealed package", pickup: "Library entrance", available: true },
  { id: 11, name: "Reusable lunch container", category: "Household", condition: "Clean and in good condition", pickup: "Main lobby", available: true },
  { id: 12, name: "Warm winter gloves", category: "Household", condition: "Clean and gently used", pickup: "Student Centre", available: true }
];

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomAvailability() {
  const shuffledDays = [...weekdays].sort(() => Math.random() - 0.5);
  const shuffledTimes = [...meetingTimes].sort(() => Math.random() - 0.5);

  return {
    availableDays: shuffledDays.slice(0, 3),
    availableTimes: shuffledTimes.slice(0, 2)
  };
}

// FORMAT TIME
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

// FORMAT AVAILABILITY
function formatAvailability(days, times) {
  const dayText = Array.isArray(days) && days.length
    ? days.join(", ")
    : "Not set";

  const timeText = Array.isArray(times) && times.length
    ? times.map(formatTime).join(", ")
    : "Not set";

  return `${dayText} · ${timeText}`;
}

// ESCAPE USER TEXT
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

// SAVE LISTINGS
function saveItems(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Could not save listings:", error);
  }
}

// LOAD LISTINGS
const DEMO_MEETUP_MIGRATION_KEY =
  "campusPantryOwnerAvailabilityMigration_v4";

function getItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    const source = Array.isArray(saved) ? saved : initial;

    const missing = initial.filter(seed =>
      !source.some(item => Number(item.id) === Number(seed.id))
    );

    const migrationNeeded =
      localStorage.getItem(DEMO_MEETUP_MIGRATION_KEY) !== "done";

    const merged = [...source, ...missing].map(item => {
      const sample = initial.find(seed =>
        Number(seed.id) === Number(item.id)
      );

      const isSample = Boolean(sample);
      const shouldRefresh = migrationNeeded && isSample;

      let availableDays = Array.isArray(item.availableDays)
        ? item.availableDays : [];

      let availableTimes = Array.isArray(item.availableTimes)
        ? item.availableTimes : [];

      if (shouldRefresh || !availableDays.length || !availableTimes.length) {
        if (isSample) {
          const generated = randomAvailability();
          availableDays = generated.availableDays;
          availableTimes = generated.availableTimes;
        } else {
          if (!availableDays.length) {
            availableDays = weekdays.slice(0, 3);
          }

          if (!availableTimes.length) {
            availableTimes = [randomChoice(meetingTimes)];
          }
        }
      }

      return {
        ...item,
        owner: item.owner || (
          isSample ? "Campus Pantry Student" : CURRENT_STUDENT
        ),
        pickup: meetingPoints.includes(item.pickup)
          ? item.pickup
          : randomChoice(meetingPoints),
        availableDays: availableDays.filter(day =>
          weekdays.includes(day)
        ),
        availableTimes: availableTimes.filter(time =>
          meetingTimes.includes(time)
        )
      };
    });

    saveItems(merged);

    if (migrationNeeded) {
      localStorage.setItem(DEMO_MEETUP_MIGRATION_KEY, "done");
    }

    return merged;

  } catch (error) {
    console.error("Error loading listings:", error);
    return initial;
  }
}

// SAVE REQUESTS
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
  } catch (error) {
    console.error("Could not save requests:", error);
  }
}

// BROWSE ITEMS PAGE
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
        <small>Listed by: ${esc(item.owner)}</small>
        <small>Meeting point: ${esc(item.pickup)}</small>
        <small>Meetup: ${esc(formatAvailability(item.availableDays, item.availableTimes))}</small>
        <button class="btn" data-id="${item.id}">View details</button>
      `;

      grid.appendChild(card);
    });
  }

  // OPEN ITEM DETAILS
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
    document.getElementById("modal-owner").textContent = item.owner;
    document.getElementById("modal-meetup").textContent =
      formatAvailability(item.availableDays, item.availableTimes);

    const requestDay = document.getElementById("request-day");
    const requestTime = document.getElementById("request-time");

    requestDay.innerHTML =
      '<option value="">Choose an available day</option>' +
      (item.availableDays || []).map(day =>
        `<option value="${esc(day)}">${esc(day)}</option>`
      ).join("");

    requestTime.innerHTML =
      '<option value="">Choose an available time</option>' +
      (item.availableTimes || []).map(time =>
        `<option value="${esc(time)}">${esc(formatTime(time))}</option>`
      ).join("");

    requestDay.disabled = !(item.availableDays || []).length;
    requestTime.disabled = !(item.availableTimes || []).length;

    requestFeedback.textContent = "";

    if (payItForwardMessage) {
      payItForwardMessage.hidden = true;
    }

    requestButton.disabled = false;
    requestButton.textContent = "Request item";

    modal.hidden = false;
  });

  // REQUEST ITEM
  requestButton.addEventListener("click", () => {
    const item = items.find(entry =>
      Number(entry.id) === Number(selected)
    );

    if (!item || !item.available) return;

    const selectedDay = document.getElementById("request-day").value;
    const selectedTime = document.getElementById("request-time").value;

    if (!selectedDay || !selectedTime) {
      requestFeedback.textContent =
        "Please choose an available day and time.";
      return;
    }

    if (
      !(item.availableDays || []).includes(selectedDay) ||
      !(item.availableTimes || []).includes(selectedTime)
    ) {
      return;
    }

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
      meetupDay: selectedDay,
      meetupTime: selectedTime,
      date: new Date().toLocaleString(),
      status: "Requested"
    });

    saveRequests(requests);
    render();

    requestFeedback.textContent = "Request submitted successfully!";

    if (payItForwardMessage) {
      payItForwardMessage.hidden = false;
    }

    requestButton.textContent = "Requested";
    requestButton.disabled = true;
  });

  // CLOSE MODAL
  function closeModal() {
    modal.hidden = true;
  }

  document.getElementById("close-modal")
    .addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
    if (event.target.id === "modal") closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  search.addEventListener("input", render);
  category.addEventListener("change", render);

  render();
}

// GIVE AN ITEM PAGE WITH SUCCESS CONFIRMATION
const form = document.getElementById("give-form");

if (form) {
  const successMessage = document.getElementById("listing-success");
  const feedback = document.getElementById("give-feedback");
  const listAnotherButton = document.getElementById("list-another");

  form.addEventListener("submit", event => {
    event.preventDefault();

    const items = getItems();

    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value;
    const condition = document.getElementById("item-condition").value.trim();
    const pickup = document.getElementById("pickup").value;

    const availableDays = [
      ...document.querySelectorAll(
        'input[name="available-days"]:checked'
      )
    ].map(input => input.value);

    const availableTimes = [
      ...document.querySelectorAll(
        'input[name="available-times"]:checked'
      )
    ].map(input => input.value);

    if (
      !name ||
      !category ||
      !condition ||
      !pickup ||
      availableDays.length === 0 ||
      availableTimes.length === 0
    ) {
      feedback.textContent =
        "Please complete all fields and select available days and times.";
      return;
    }

    // CREATE NEW LISTING
    const newItem = {
      id: Date.now(),
      name: name,
      category: category,
      condition: condition,
      pickup: pickup,
      owner: CURRENT_STUDENT,
      availableDays: availableDays,
      availableTimes: availableTimes,
      available: true,
      listingStatus: "Available"
    };

    // SAVE LISTING
    items.unshift(newItem);
    saveItems(items);

    // RESET FORM
    form.reset();

    // SHOW SUCCESS CONFIRMATION
    form.hidden = true;
    feedback.textContent = "";
    successMessage.hidden = false;

    successMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  // LIST ANOTHER ITEM
  listAnotherButton.addEventListener("click", () => {
    successMessage.hidden = true;
    form.hidden = false;
    form.reset();

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

// MY REQUESTS PAGE
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
        <p>Listed by: ${esc(request.owner || "Campus Pantry Student")}</p>
        <p>Meeting point: ${esc(request.pickup)}</p>
        <p>Meetup: ${esc(request.meetupDay || "Not selected")} · ${esc(formatTime(request.meetupTime))}</p>
        <p>Requested: ${esc(request.date)}</p>
        <button class="btn cancel-request" data-request-id="${request.id}">
          Cancel request
        </button>
      `;

      requestsList.appendChild(card);
    });
  }

  // CANCEL REQUEST
  requestsList.addEventListener("click", event => {
    const button = event.target.closest("button[data-request-id]");
    if (!button) return;

    const requestId = Number(button.dataset.requestId);
    const requests = getRequests();

    const request = requests.find(entry =>
      Number(entry.id) === requestId
    );

    if (!request || request.status !== "Requested") return;

    saveRequests(
      requests.filter(entry => Number(entry.id) !== requestId)
    );

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

// MY LISTINGS PAGE
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
        <p>Meetup: ${esc(formatAvailability(item.availableDays, item.availableTimes))}</p>
        <p>Listed by: ${esc(item.owner)}</p>
        <strong class="listing-status">${status}</strong>
        ${
          item.available
            ? `<button class="btn cancel-listing" data-item-id="${item.id}">Cancel listing</button>`
            : `<p class="sub">This item has already been requested.</p>`
        }
      `;

      myListings.appendChild(card);
    });
  }

  // CANCEL LISTING
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
