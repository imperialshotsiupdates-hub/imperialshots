// ========================= FIREBASE IMPORT =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";


// ========================= FIREBASE CONFIG =========================
// ⚠ Apna original firebaseConfig yaha paste karo
const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c",
  storageBucket: "imperialshots-d468c.firebasestorage.app",
  messagingSenderId: "819570202874",
  appId: "1:819570202874:web:06f2af78fca0a35f2d5143",
  measurementId: "G-6DQDKML9S5"
};

// ========================= INIT =========================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ========================= GLOBALS =========================
let packagesData = {};

const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const packagesContainer = document.getElementById("packagesContainer");


// ========================= RENDER FUNCTION =========================
function renderPackages(data) {
  if (!packagesContainer) return;

  packagesContainer.innerHTML = "";

  const keys = Object.keys(data);

  if (keys.length === 0) {
    packagesContainer.innerHTML = "<p>No packages found.</p>";
    return;
  }

  keys.forEach(id => {
    const pkg = data[id];

    packagesContainer.innerHTML += `
      <div class="package-card">
        <h3>${pkg.name || "No Name"}</h3>
        <p>₹${pkg.price || "0"}</p>
        <p>${pkg.description || ""}</p>
      </div>
    `;
  });
}


// ========================= POPULATE CITY DROPDOWN =========================
function populateCities(data) {
  if (!cityFilter) return;

  const cities = new Set();

  Object.values(data).forEach(pkg => {
    if (pkg.availableCities) {
      Object.keys(pkg.availableCities).forEach(city => {
        cities.add(city);
      });
    }
  });

  cityFilter.innerHTML = `<option value="">All Cities</option>`;

  cities.forEach(city => {
    cityFilter.innerHTML += `<option value="${city}">${city}</option>`;
  });
}


// ========================= FILTER FUNCTION =========================
function applyFilters() {
  if (!packagesData) return;

  const text = searchInput?.value.toLowerCase().trim() || "";
  const selectedCity = cityFilter?.value || "";

  const filtered = {};

  Object.keys(packagesData).forEach(id => {
    const pkg = packagesData[id];

    // Only active packages
    if (pkg.status !== "active") return;

    // Search filter
    const nameMatch = pkg.name?.toLowerCase().includes(text);
    const priceMatch = String(pkg.price || "").includes(text);

    // City filter
    let cityMatch = true;

    if (selectedCity) {
      cityMatch =
        pkg.availableCities &&
        pkg.availableCities[selectedCity];
    }

    if ((!text || nameMatch || priceMatch) && cityMatch) {
      filtered[id] = pkg;
    }
  });

  renderPackages(filtered);
}


// ========================= AUTO LOCATION DETECT =========================
function detectUserCityAndFilter() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();

      const detectedCity =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "";

      if (detectedCity && cityFilter) {
        cityFilter.value = detectedCity;
        applyFilters();
      }
    } catch (err) {
      console.log("Location detect failed");
    }
  });
}


// ========================= EVENTS =========================
searchInput?.addEventListener("input", applyFilters);
cityFilter?.addEventListener("change", applyFilters);


// ========================= LOAD PACKAGES =========================
onValue(ref(db, "packages"), snapshot => {
  packagesData = snapshot.val() || {};
  populateCities(packagesData);
  renderPackages(packagesData);
  detectUserCityAndFilter();
});