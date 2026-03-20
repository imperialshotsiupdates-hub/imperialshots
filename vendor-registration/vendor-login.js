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

// ================= LOGIN FUNCTION =================
function vendorLogin() {

  const loginId = document.getElementById("loginId").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageBox = document.getElementById("loginMessage");

  if (!loginId || !password) {
    messageBox.style.color = "red";
    messageBox.innerHTML = "Please enter Login ID and Password";
    return;
  }

  db.ref("vendorCredentials/" + loginId).once("value")
    .then(snapshot => {

      if (!snapshot.exists()) {
        messageBox.style.color = "red";
        messageBox.innerHTML = "Invalid Login ID";
        return;
      }

      const data = snapshot.val();

      if (data.password !== password) {
        messageBox.style.color = "red";
        messageBox.innerHTML = "Incorrect Password";
        return;
      }

      // ✅ LOGIN SUCCESS
      messageBox.style.color = "#22c55e";
      messageBox.innerHTML = "Login Successful! Redirecting...";

      // Store session
      localStorage.setItem("vendorLoginId", loginId);
      localStorage.setItem("vendorName", data.name);
      localStorage.setItem("vendorPhone", data.phone);

      // Redirect to Vendor Dashboard
      setTimeout(() => {
        window.location.href = "vendor-dashboard.html";
      }, 1000);

    })
    .catch(error => {
      messageBox.style.color = "red";
      messageBox.innerHTML = "Error: " + error.message;
    });
}
