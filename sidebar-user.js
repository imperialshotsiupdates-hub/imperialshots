// ================= FIREBASE CONFIG =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ================= DOM =================
const signinBox = document.getElementById("signinBox");
const userBox = document.getElementById("userBox");
const sidebarName = document.getElementById("sidebarName");
const sidebarEmail = document.getElementById("sidebarEmail");

// ================= AUTH =================
onAuthStateChanged(auth, async (user) => {

  // ❌ Not logged in
  if (!user) {

    signinBox.style.display = "block";
    userBox.style.display = "none";

    sidebarName.innerText = "Guest";
    sidebarEmail.innerText = "Login Required";

    return;
  }

  // ✅ Logged in
  signinBox.style.display = "none";
  userBox.style.display = "block";

  // Default (Auth backup)
  let name = user.displayName || "User";
  let email = user.email || "-";

  try {

    const userRef = ref(db, "users/" + user.uid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {

      const data = snapshot.val();

      // ✅ RTDB Priority
      name = data.name || name;
      email = data.email || email;

    }

  } catch (err) {

    console.error("Sidebar Fetch Error:", err);

  }

  // ✅ FINAL DISPLAY
  sidebarName.innerText = name;
  sidebarEmail.innerText = email;

});
