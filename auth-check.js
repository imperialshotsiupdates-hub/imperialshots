const signupBtn = document.getElementById("signupBtn");
const profileBox = document.getElementById("profileBox");
const userEmailSpan = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Check login state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // USER LOGGED IN
    signupBtn && (signupBtn.style.display = "none");
    profileBox && (profileBox.style.display = "flex");

    if (userEmailSpan) {
      userEmailSpan.textContent = user.email || user.displayName;
    }
  } else {
    // USER LOGGED OUT
    signupBtn && (signupBtn.style.display = "inline-block");
    profileBox && (profileBox.style.display = "none");
  }
});

// Logout
logoutBtn?.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
});
