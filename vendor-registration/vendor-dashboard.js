// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDmmcRlCs6K0PzxnFkuA0qv5U5K3V6x8QQ",
  authDomain: "vendors-d084b.firebaseapp.com",
  databaseURL: "https://vendors-d084b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vendors-d084b",
  storageBucket: "vendors-d084b.firebasestorage.app",
  messagingSenderId: "58526160322",
  appId: "1:58526160322:web:dbd489764ebfc5e2eff25b",
  measurementId: "G-6MHKLQR9S7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================= AUTH CHECK =================
const vendorLoginId = localStorage.getItem("vendorLoginId");
const vendorName = localStorage.getItem("vendorName");

if (!vendorLoginId) {
  window.location.href = "vendor-login.html";
}

// Show vendor name
document.getElementById("vendorName").innerText = vendorName || "Vendor";

// ================= NAVIGATION =================
function goTo(page) {
  window.location.href = page;
}

// ================= LOGOUT =================
function logout() {
  localStorage.clear();
  window.location.href = "vendor-login.html";
}
