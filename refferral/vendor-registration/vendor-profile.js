import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getDatabase,
  ref,
  get
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ===== LOGIN CHECK ===== */
const vendorLoginId = localStorage.getItem("vendorLoginId");

if (!vendorLoginId) {
  window.location.href = "vendor-login.html";
}

/* ===== FIREBASE CONFIG ===== */
const firebaseConfig = {
  apiKey: "AIzaSyDmmcRlCs6K0PzxnFkuA0qv5U5K3V6x8QQ",
  authDomain: "vendors-d084b.firebaseapp.com",
  databaseURL: "https://vendors-d084b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vendors-d084b",
  storageBucket: "vendors-d084b.firebasestorage.app",
  messagingSenderId: "58526160322",
  appId: "1:58526160322:web:dbd489764ebfc5e2eff25b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const profileCard = document.getElementById("profileCard");

async function loadProfile() {

  /* ===== 1️⃣ GET APPROVED VENDOR DATA ===== */
  const approvedSnap = await get(ref(db, "vendors/approved"));

  if (!approvedSnap.exists()) {
    profileCard.innerHTML = "Profile not found.";
    return;
  }

  let vendorData = null;

  approvedSnap.forEach(child => {
    const v = child.val();
    if (v.vendorLoginId === vendorLoginId) {
      vendorData = v;
    }
  });

  if (!vendorData) {
    profileCard.innerHTML = "Profile not found.";
    return;
  }

  /* ===== 2️⃣ GET CREDENTIALS ===== */
  const credSnap = await get(ref(db, "vendorCredentials/" + vendorLoginId));

  let loginId = "-";
  let password = "-";

  if (credSnap.exists()) {
    const cred = credSnap.val();
    loginId = cred.loginId;
    password = cred.password;
  }

  /* ===== 3️⃣ RENDER PROFILE ===== */

  profileCard.innerHTML = `

    <div class="section">
      <h3>Login Details</h3>
      <div class="info">
        <div><b>Login ID:</b> ${loginId}</div>
        <div><b>Password:</b> ${password}</div>
      </div>
    </div>

    <div class="section">
      <h3>Basic Information</h3>
      <div class="info">
        <div><b>Name:</b> ${vendorData.name || "-"}</div>
        <div><b>Phone:</b> ${vendorData.phone || "-"}</div>
        <div><b>Email:</b> ${vendorData.email || "-"}</div>
        <div><b>DOB:</b> ${vendorData.dob || "-"}</div>
        <div><b>City:</b> ${vendorData.city || "-"}</div>
      </div>
    </div>

    <div class="section">
      <h3>Studio Information</h3>
      <div class="info">
        <div><b>Camera:</b> ${vendorData.assets?.camera || "-"}</div>
        <div><b>Drone:</b> ${vendorData.assets?.drone || "-"}</div>
        <div><b>Lights:</b> ${vendorData.assets?.lights || "-"}</div>
        <div><b>Software:</b> ${vendorData.assets?.software || "-"}</div>
        <div><b>Portfolio:</b>
          ${
            vendorData.assets?.portfolio
              ? `<a href="${vendorData.assets.portfolio}" target="_blank">View Portfolio</a>`
              : "-"
          }
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Identity Proof</h3>
      <div class="info">
        <div><b>Aadhaar:</b> ${vendorData.identity?.aadhaar || "-"}</div>
        <div><b>PAN:</b> ${vendorData.identity?.pan || "-"}</div>
      </div>
    </div>

  `;
}

loadProfile();
