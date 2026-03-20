const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  projectId: "imperialshots-d468c"
};

// INIT
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Email
  document.getElementById("userEmail").innerText = user.email;

  // UID
  document.getElementById("userId").innerText = user.uid;

  const userRef = firebase.database().ref("users/" + user.uid);

  userRef.once("value").then(snapshot => {

    if (snapshot.exists()) {

      const data = snapshot.val();

      // ✅ NAME
      document.getElementById("userName").innerText =
        data.name || user.displayName || "User";

      // ✅ ROLE
      document.getElementById("userRole").innerText =
        data.role || "User";

    } else {

      document.getElementById("userName").innerText =
        user.displayName || "User";

    }

  });

});
