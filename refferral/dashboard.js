// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDmmcRlCs6K0PzxnFkuA0qv5U5K3V6x8QQ",
  authDomain: "vendors-d084b.firebaseapp.com",
  databaseURL: "https://vendors-d084b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vendors-d084b"
};

// INIT FIREBASE
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// ================= CHECK LOGIN =================
let userId = localStorage.getItem("user");

if (!userId) {
  window.location = "login.html";
}

// ================= LOAD USER =================
db.ref("users/" + userId).once("value")
.then(snap => {

  if(!snap.exists()){
    alert("User not found");
    localStorage.removeItem("user");
    window.location="login.html";
    return;
  }

  let data = snap.val();

  // Referral code show
  document.getElementById("refCode").innerText = data.referral;

  // Load vendors by referral
  loadVendors(data.referral);

});


// ================= LOAD VENDORS =================
function loadVendors(code){

  db.ref("vendors").on("value", snapshot => {

    let total = 0;
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    let html = "";

    snapshot.forEach(section => {

      section.forEach(v => {

        let data = v.val();

        if(data.referral === code){

          total++;

          if(data.status === "approved") approved++;
          if(data.status === "rejected") rejected++;
          if(data.status === "pending") pending++;

          html += `
          <tr>
            <td>${data.name}</td>
            <td>${data.category || "-"}</td>
            <td>${data.status}</td>
          </tr>
          `;

        }

      });

    });

    document.getElementById("total").innerText = total;
    document.getElementById("approved").innerText = approved;
    document.getElementById("rejected").innerText = rejected;
    document.getElementById("pending").innerText = pending;

    document.getElementById("vendorList").innerHTML = html;

  });

}
// ================= OPEN PROFILE =================
function openProfile(){
  window.location = "profile.html";
}


// ================= COPY REFERRAL =================
function copyReferral(){

  let code = document.getElementById("refCode").innerText;

  navigator.clipboard.writeText(code);

  alert("Referral Code Copied!");
}


// ================= LOGOUT =================
function logout(){

  if(confirm("Logout from account?")){
    localStorage.removeItem("user");
    window.location = "index.html";
  }

}