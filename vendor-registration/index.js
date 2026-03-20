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

// ================= STEP NAVIGATION =================
function nextStep(step) {
  if (step === 1) {
    const dob = document.getElementById("dob").value;
    const age = calculateAge(dob);
    if (age < 18) {
      alert("Minimum age must be 18");
      return;
    }
  }

  document.getElementById("step" + step).classList.remove("active");
  document.getElementById("step" + (step + 1)).classList.add("active");
}

function prevStep(step) {
  document.getElementById("step" + step).classList.remove("active");
  document.getElementById("step" + (step - 1)).classList.add("active");
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// ================= SUBMIT =================
function submitVendor() {

  const agree = document.getElementById("agreeTerms").checked;

  if(!agree){
    alert("Please agree to Terms & Conditions before submitting.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const age = calculateAge(dob);

  const studioName = document.getElementById("studioName").value;
  const camera = document.getElementById("camera").value;
  const drone = document.getElementById("drone").value;
  const lights = document.getElementById("lights").value;
  const gimble = document.getElementById("gimble").value;
  const mic = document.getElementById("mic").value;
  const software = document.getElementById("software").value;
  const experience = document.getElementById("experience").value;
  const portfolio = document.getElementById("portfolio").value;

  const aadhaar = document.getElementById("aadhaar").value;
  const pan = document.getElementById("pan").value;

  const referral = document.getElementById("referral").value.trim().toUpperCase() || "direct";

  if (!name || !phone || !email || !dob || !studioName || !portfolio || !aadhaar || !pan) {
    alert("Please fill all required fields");
    return;
  }

  db.ref("vendors/pending").push({
    name,
    phone,
    email,
    dob,
    age,
    city: "-",
    studioName,

    referral: referral,  // 👈 IMPORTANT

    assets: {
      camera,
      drone,
      lights,
      gimble,
      mic,
      software,
      portfolio
    },
    experience,

    identity: {
      aadhaar,
      pan
    },

    status: "pending",
    createdAt: Date.now()
  });

  document.getElementById("successMessage").classList.remove("hidden");
  document.getElementById("successMessage").innerHTML =
    "Registration submitted successfully! <br>Status: Pending";

  document.querySelectorAll(".form-step").forEach(step => step.classList.remove("active"));
}

// ================= CHECK STATUS =================
function checkStatus() {

  const name = document.getElementById("checkName").value.trim().toLowerCase();
  const phone = document.getElementById("checkPhone").value.trim();

  if (!name || !phone) {
    alert("Please enter name and phone number");
    return;
  }

  const sections = ["pending", "approved", "rejected"];
  let found = false;

  document.getElementById("statusResult").innerHTML = "Checking status...";

  sections.forEach(section => {

    if (found) return;

    db.ref("vendors/" + section).once("value").then(snapshot => {

      if (!snapshot.exists() || found) return;

      snapshot.forEach(vendorSnap => {

        if (found) return;

        const data = vendorSnap.val();

        if (
          data.name &&
          data.phone &&
          data.name.toLowerCase() === name &&
          data.phone === phone
        ) {

          found = true;

          if (section === "approved") {
            document.getElementById("statusResult").innerHTML = `
              <span style="color:#22c55e;font-weight:600;">
                Status: Approved
              </span><br>
              <a href="vendor-login.html">Go To Login</a>
            `;
          }
          else if (section === "rejected") {
            document.getElementById("statusResult").innerHTML = `
              <span style="color:#ef4444;font-weight:600;">
                Sorry! Your registration was rejected.
              </span>
            `;
          }
          else {
            document.getElementById("statusResult").innerHTML = `
              <span style="color:#facc15;font-weight:600;">
                Status: Pending. Please wait for response.
              </span>
            `;
          }
        }

      });

      // agar sab sections check ho gaye aur kuch nahi mila
      setTimeout(() => {
        if (!found) {
          document.getElementById("statusResult").innerHTML =
            "No registration found with this name and phone number.";
        }
      }, 800);

    });

  });

}
