// 🔥 Firebase Config
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

// INIT
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ===========================
   LOGIN
=========================== */
document.querySelector(".login-btn").addEventListener("click", (e) => {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "index.html"; // homepage
    })
    .catch(err => alert(err.message));
});

/* ===========================
   SIGN UP
=========================== */
signupForm.onsubmit = e => {
  e.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = signupEmail.value;
  const password = signupPassword.value;

  auth.createUserWithEmailAndPassword(email, password)

    .then(res => {

      const user = res.user;

      // ✅ AUTH PROFILE ME NAME
      return user.updateProfile({
        displayName: name
      }).then(() => {

        // ✅ RTDB ME SAVE
        return firebase.database()
          .ref("users/" + user.uid)
          .set({
            name: name,
            email: user.email,
            role: "user",
            createdAt: Date.now()
          });

      });

    })

    .then(() => {
      window.location.href = "profile.html";
    })

    .catch(err => alert(err.message));
};

/* ===========================
   GOOGLE LOGIN
=========================== */
const provider = new firebase.auth.GoogleAuthProvider();

document.querySelector(".google-btn").addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then(res => createUserIfNotExists(res.user))
    .then(() => window.location.href = "index.html")
    .catch(err => alert(err.message));
});

document.getElementById("signupGoogleBtn").addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then(res => createUserIfNotExists(res.user))
    .then(() => window.location.href = "index.html")
    .catch(err => alert(err.message));
});

function createUserIfNotExists(user) {
  const ref = db.collection("users").doc(user.uid);
  return ref.get().then(doc => {
    if (!doc.exists) {
      return ref.set({
        email: user.email,
        name: user.displayName || "",
        role: "user",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  });
}

/* ===========================
   FORGOT PASSWORD
=========================== */
document.getElementById("sendResetBtn").addEventListener("click", () => {
  const email = forgotEmail.value;

  auth.sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent"))
    .catch(err => alert(err.message));
});

/* ===========================
   AUTH STATE CHECK
=========================== */
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("Logged in:", user.email);
  }
});

/* ===========================
   MODALS (UI SAFE)
=========================== */
const signupModal = document.getElementById("signupModal");
const forgotModal = document.getElementById("forgotModal");

document.querySelector(".signup-link").onclick = () => signupModal.style.display = "flex";
document.querySelector(".forgot-link").onclick = () => forgotModal.style.display = "flex";

document.querySelectorAll(".close-btn").forEach(btn => {
  btn.onclick = () => {
    signupModal.style.display = "none";
    forgotModal.style.display = "none";
  };
});
