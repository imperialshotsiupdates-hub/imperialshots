import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
  get
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ===== AUTH CHECK ===== */
const vendorLoginId = localStorage.getItem("vendorLoginId");
if (!vendorLoginId) {
  window.location.href = "vendor-login.html";
}

/* ===== FIREBASE ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ===== DOM ===== */
const table = document.getElementById("bookingTable");
const detailBox = document.getElementById("detailBox");
const search = document.getElementById("bookingSearch");

/* ===== SAFE DATE FORMAT ===== */
function formatDate(dateValue) {
  if (!dateValue) return "-";

  // If timestamp
  if (!isNaN(dateValue)) {
    return new Date(Number(dateValue)).toLocaleDateString();
  }

  // If already string date
  return dateValue;
}

/* ===== SEARCH ===== */
search.oninput = () => {
  const q = search.value.toLowerCase();
  document.querySelectorAll("tr.data").forEach(r => {
    r.style.display =
      r.innerText.toLowerCase().includes(q) ? "" : "none";
  });
};

/* ===== LOAD BOOKINGS ===== */
onValue(ref(db, "bookings"), async snap => {

  table.innerHTML = "";
  detailBox.style.display = "none";

  if (!snap.exists()) return;

  const pkgSnap = await get(ref(db, "packages"));
  if (!pkgSnap.exists()) return;

  const packages = pkgSnap.val();

  snap.forEach(child => {

    const booking = child.val();
    const bookingId = child.key;

    if (!booking.packageName) return;

    let belongsToVendor = false;

    Object.values(packages).forEach(pkg => {
      if (
        pkg.name === booking.packageName &&
        pkg.vendorLoginId === vendorLoginId
      ) {
        belongsToVendor = true;
      }
    });

    if (!belongsToVendor) return;

    renderRow(bookingId, booking);
  });
});

/* ===== RENDER ROW ===== */
function renderRow(id, b) {

  const totalAmount = Number(b.totalAmount || 0);

  let totalPaid = 0;

  if (b.payments) {
    totalPaid = Object.values(b.payments)
      .reduce((sum, p) =>
        sum + Number(p.amount || 0), 0);
  }

  const remaining = totalAmount - totalPaid;

  const isCompleted = remaining <= 0;

  const eventDate =
    b.eventDate || b.startDate || "-";

  const tr = document.createElement("tr");
  tr.className = "data";

  tr.innerHTML = `
    <td>${b.bookingID || id}</td>
    <td>${b.clientName || "-"}</td>
    <td>${b.clientPhone || "-"}</td>
    <td>${formatDate(eventDate)}</td>
    <td>${b.packageName || "-"}</td>
    <td>₹${totalAmount}</td>
    <td>₹${totalPaid}</td>
    <td>₹${remaining}</td>

    <td class="${isCompleted ? "status-paid" : "status-unpaid"}">
      ${isCompleted ? "Completed" : "Pending"}
    </td>

    <td><button>View</button></td>
  `;

  tr.onclick = () =>
    showDetails(id, b, totalPaid, remaining);

  table.appendChild(tr);
}

/* ===== DETAILS ===== */
function showDetails(id, b, paid, remaining) {

  const totalAmount = Number(b.totalAmount || 0);
  const isCompleted = remaining <= 0;

  let paymentHTML = "<li>No payments</li>";

  if (b.payments) {
    paymentHTML = Object.values(b.payments).map(p => `
      <li>
        <b>${p.type || "-"}</b> : ₹${Number(p.amount || 0)}
        <br>
        Payment ID: ${p.paymentId || "-"}
        <br>
        ${p.paidAt ? new Date(p.paidAt).toLocaleString() : "-"}
      </li>
    `).join("");
  }

  const eventDate =
    b.eventDate || b.startDate || "-";

  detailBox.innerHTML = `
    <h3>Booking Full Details</h3>
    <hr>

    <p><b>Booking ID:</b> ${b.bookingID || id}</p>
    <p><b>Status:</b>
      ${isCompleted ? "Completed" : "Pending"}
    </p>
    <p><b>Created At:</b>
      ${b.createdAt
        ? new Date(b.createdAt).toLocaleString()
        : "-"}
    </p>

    <hr>

    <h4>Client Details</h4>
    <p><b>Name:</b> ${b.clientName || "-"}</p>
    <p><b>Phone:</b> ${b.clientPhone || "-"}</p>
    <p><b>Email:</b> ${b.clientEmail || "-"}</p>

    <hr>

    <h4>Event Details</h4>
    <p><b>Start Date:</b> ${formatDate(b.startDate)}</p>
    <p><b>End Date:</b> ${formatDate(b.endDate)}</p>
    <p><b>Event Date:</b> ${formatDate(eventDate)}</p>

    <hr>

    <h4>Address</h4>
    <p><b>Address:</b> ${b.address || "-"}</p>
    <p><b>Location:</b> ${b.location || "-"}</p>
    <p><b>City:</b> ${b.city || "-"}</p>
    <p><b>Pincode:</b> ${b.pincode || "-"}</p>

    <hr>

    <h4>Package Details</h4>
    <p><b>Package:</b> ${b.packageName || "-"}</p>
    <p><b>Total Amount:</b> ₹${totalAmount}</p>
    <p><b>Discount:</b> ₹${Number(b.discount || 0)}</p>

    <hr>

    <h4>Payment Structure</h4>
    <p><b>Advance:</b> ₹${Number(b.advanceAmount || 0)}</p>
    <p><b>Mid Payment:</b> ₹${Number(b.midAmount || 0)}</p>
    <p><b>Final Payment:</b> ₹${Number(b.finalAmount || 0)}</p>
    <p><b>Total Paid:</b> ₹${paid}</p>
    <p><b>Remaining:</b> ₹${remaining}</p>

    <hr>

    <h4>Staff</h4>
    <p><b>Assigned Staff:</b>
      ${b.assignedStaff || "Not Assigned"}
    </p>

    <hr>

    <h4>Payment History</h4>
    <ul>${paymentHTML}</ul>
  `;

  detailBox.style.display = "block";
}