/* ===============================
   🔥 USER BOOKING – IMPERIAL SHOTS (FINAL)
   =============================== */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  child
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* 🔐 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* 📦 DOM */
const bookingForm = document.getElementById("bookingForm");
const packageSelect = document.getElementById("bpackage");

let packageCache = {};

/* 🔁 LOAD PACKAGES FROM RTDB */
async function loadPackages() {
  const snapshot = await get(ref(db, "packages"));
  if (!snapshot.exists()) return;

  packageSelect.innerHTML = `<option value="">Select Package</option>`;

  snapshot.forEach(childSnap => {
    const pkgId = childSnap.key;
    const pkg = childSnap.val();

    if (pkg.status !== "active") return;

    packageCache[pkgId] = pkg;

    const opt = document.createElement("option");
    opt.value = pkgId;
    opt.textContent = `${pkg.name} - ₹${pkg.price}`;
    packageSelect.appendChild(opt);
  });
}

loadPackages();

/* 🆔 BOOKING ID */
function generateBookingId() {
  return "IMP" + Math.floor(100000 + Math.random() * 900000);
}

/* 📝 FORM SUBMIT */
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("bfname").value.trim();
  const lastName  = document.getElementById("blname").value.trim();
  const phone     = document.getElementById("bphone").value.trim();
  const city      = document.getElementById("bcity").value.trim();
  const pincode   = document.getElementById("bpincode").value.trim();
  const address   = document.getElementById("blocation").value.trim();
  const date      = document.getElementById("bdate").value;
  const pkgId     = packageSelect.value;

  if (!firstName || !phone || !date || !pkgId) {
    alert("⚠️ Please fill all required fields");
    return;
  }

  const selectedPkg = packageCache[pkgId];
  if (!selectedPkg) {
    alert("❌ Package not found");
    return;
  }

  const totalAmount = Number(selectedPkg.price) || 0;
  const bookingId = generateBookingId();

  const bookingRef = push(ref(db, "bookings"));

  const bookingData = {
    bookingId: bookingId,

    clientName: `${firstName} ${lastName}`,
    clientPhone: phone,

    address: address,
    city: city,
    pincode: pincode,

    eventDate: date,

    packageId: pkgId,
    packageName: selectedPkg.name,

    totalAmount: totalAmount,
    paidAmount: 0,
    remainingAmount: totalAmount,

    status: "Pending",

    staffAssigned: false,
    staffName: "",
    staffId: "",

    viewedByAdmin: false,
    createdAt: Date.now()
  };

  await set(bookingRef, bookingData);

  localStorage.setItem("activeBooking", bookingRef.key);
  alert("✅ Booking submitted successfully");
  bookingForm.reset();

  window.location.href = "booking-details.html"; // ✅ typo fixed
});
