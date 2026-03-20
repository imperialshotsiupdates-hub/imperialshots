
const loader = document.getElementById("loader");
// ========================= Firebase Init =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ========================= Global Variables =========================
let currentUser = null;
let packagesData = {};

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// ========================= Elements =========================
const packagesContainer = document.getElementById("packagesContainer");
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");

const bfname = document.getElementById("bfname");
const blname = document.getElementById("blname");
const bphone = document.getElementById("bphone");
const bstartDate = document.getElementById("bstartDate");
const bendDate = document.getElementById("bendDate");
const blocation = document.getElementById("blocation");
const baddress = document.getElementById("baddress");
const bcity = document.getElementById("bcity");
const bpincode = document.getElementById("bpincode");
const bpackage = document.getElementById("bpackage");
const bprice = document.getElementById("bprice");

// 🔍 Search & City
const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");

// ========================= ⭐ Rating Function =========================
function renderStars(avgRating = 0, packageId = null) {
  let starsHTML = "";
  const rounded = Math.round(avgRating);

  for (let i = 1; i <= 5; i++) {
    starsHTML += `
      <i class="fa fa-star star ${i <= rounded ? "filled" : ""}"
         ${packageId ? `onclick="window.submitRating('${packageId}', ${i})"` : ""}>
      </i>`;
  }

  return `
    <div class="stars">
      ${starsHTML}
      <span class="rating-number">
        ${avgRating ? avgRating.toFixed(1) : "0.0"}
      </span>
    </div>
  `;
}

(function addPopupCSS(){
  if (document.getElementById("ratingPopupStyle")) return;

  const style = document.createElement("style");
  style.id = "ratingPopupStyle";
  style.innerHTML = `
    .popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999}
    .popup-box{background:#0f172a;padding:28px 35px;border-radius:18px;text-align:center;color:#e2e8f0;min-width:280px}
    .popup-icon{font-size:38px;margin-bottom:10px}
  `;
  document.head.appendChild(style);
})();

function showPopup(icon,title,message){
  if(document.getElementById("customPopup")) return;

  const popup=document.createElement("div");
  popup.id="customPopup";
  popup.innerHTML=`
  <div class="popup-overlay">
  <div class="popup-box">
  <div class="popup-icon">${icon}</div>
  <h3>${title}</h3>
  <p>${message}</p>
  </div></div>`;
  document.body.appendChild(popup);
  setTimeout(()=>popup.remove(),2500);
}

window.submitRating = async function(packageId,rating){

  if(!currentUser){
    showPopup("⚠️","Login Required","Please login to rate this package");
    return;
  }

  try{

    const userId=currentUser.uid;

    const userRatingRef=ref(db,`packageRatings/${packageId}/${userId}`);
    const existing=await get(userRatingRef);

    if(existing.exists()){
      showPopup("⭐","Already Rated","You have already rated this package");
      return;
    }

    await set(userRatingRef,{
      rating:rating,
      userId:userId,
      createdAt:Date.now()
    });

    const allRatingsSnap=await get(ref(db,`packageRatings/${packageId}`));

    let total=0;
    let count=0;

    if(allRatingsSnap.exists()){
      allRatingsSnap.forEach(child=>{
        total+=child.val().rating;
        count++;
      });
    }

    const avg=count>0?total/count:0;

    await update(ref(db,`packages/${packageId}`),{rating:avg});

    if(packagesData && packagesData[packageId]){
      packagesData[packageId].rating=avg;
      renderPackages(packagesData);
    }

    showPopup("⭐","Thank You!","Thank you for your valuable feedback");

  }catch(err){
    console.error(err);
    showPopup("❌","Error","Rating failed");
  }
};

function populateCities(data){

  if(!cityFilter) return;

  const cities = new Set();

  Object.values(data).forEach(pkg=>{

    if(pkg.availableCities){
      Object.keys(pkg.availableCities).forEach(city=>{
        cities.add(city);
      });
    }

  });

  cityFilter.innerHTML = `<option value="">All Cities</option>`;

  cities.forEach(city=>{
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });

}

function applyFilters(){

  const text = searchInput?.value.toLowerCase().trim() || "";
  const city = cityFilter?.value || "";

  const filtered = {};

  Object.keys(packagesData).forEach(id=>{

    const pkg = packagesData[id];

    if(pkg.status !== "active") return;

    const nameMatch = pkg.name?.toLowerCase().includes(text);
    const priceMatch = String(pkg.price || "").includes(text);

    let cityMatch = true;

    // city select hai tabhi filter lage
    if(city){
     cityMatch = pkg.availableCities && pkg.availableCities[city];
    }

    if((!text || nameMatch || priceMatch) && cityMatch){
      filtered[id] = pkg;
    }

  });

  renderPackages(filtered);
}

searchInput?.addEventListener("input",applyFilters);
cityFilter?.addEventListener("change",applyFilters);
// ========================= Load Packages =========================
onValue(ref(db, "packages"), snapshot => {

  loader.style.display = "none";   // 👈 loader hide

  packagesData = snapshot.val() || {};
  populateCities(packagesData);
  applyFilters();

});

// ========================= Render Packages =========================
function renderPackages(data) {
  packagesContainer.innerHTML = "";
  Object.keys(data).forEach(packageId => {
    const pkg = data[packageId];
    if(pkg.status !== "active") return;

    const card = document.createElement("div");
    card.className = "package-card";

    const desc = pkg.description || "";
    let shortDesc = desc.split("\n").slice(0,2).join("\n");
    if(shortDesc.length > 150) shortDesc = shortDesc.substring(0,150) + "...";
    const needsReadMore = desc.length > shortDesc.length;

    card.innerHTML = `
      <div class="pkg-image-wrapper">
        <img src="${pkg.coverImage || 'https://via.placeholder.com/300'}" class="pkg-image">
        ${pkg.badgeText ? `<div class="pkg-badge" style="background:${pkg.badgeColor}; font-family:${pkg.badgeFont}">${pkg.badgeText}</div>` : ""}
      </div>

      <div class="pkg-content">
        <h3 class="pkg-name" style="font-family:${pkg.nameFont || 'Poppins'}">${pkg.name}</h3>
        <p class="pkg-title" style="font-family:${pkg.titleFont || 'Poppins'}">${pkg.title || ""}</p>
        ${renderStars(pkg.rating || 0, packageId)}
        <p class="pkg-desc">
          ${shortDesc.replace(/\n/g,"<br>")}
          ${needsReadMore ? `<span class="read-more"> Read More</span>` : ""}
        </p>
        <div class="pkg-price-row">
          ${pkg.cutPrice ? `<span class="pkg-cut-price">₹${pkg.cutPrice}</span>` : ""}
          <span class="pkg-main-price">₹${pkg.price}</span>
        </div>
        <button class="pkg-book-btn">Book Now</button>
      </div>
    `;

    if(needsReadMore){
      card.querySelector(".read-more").onclick = ()=>{
        card.querySelector(".pkg-desc").innerHTML = desc.replace(/\n/g,"<br>");
      };
    }

    // ===== Book Now Click =====
    card.querySelector(".pkg-book-btn").onclick = ()=>{
      if(!currentUser){
        alert("⚠️ Please login first");
        return;
      }

      bookingModal.style.display = "flex";
      bookingModal.dataset.packageId = packageId;

      bpackage.value = pkg.name;
      bprice.value = pkg.price;
      bcity.value = pkg.city || "";
      bstartDate.value = "";
      bendDate.value = "";
      blocation.value = "";

      injectBookingCheckbox();   // ✅ checkbox logic
      fillCurrentAddress();      // ✅ GPS + address
    };

    packagesContainer.appendChild(card);
  });
}

// ========================= BOOKING MODAL CHECKBOX =========================
function injectBookingCheckbox() {
  // avoid duplicate injection
  if(document.getElementById("bookingAgreeWrapper")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "bookingAgreeWrapper";
  wrapper.style = "margin-bottom:12px; display:flex; align-items:center; gap:8px;";

  wrapper.innerHTML = `
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
      <input type="checkbox" id="bookingAgree" style="width:18px;height:18px; accent-color:gold;">
      <span>
        I agree to the
        <a href="service-agreement.html" target="_blank" style="color:#38bdf8;">Service Statement</a>
      </span>
    </label>
  `;

  const continueBtn = document.getElementById("continueBtn");
  continueBtn.parentNode.insertBefore(wrapper, continueBtn);

  const checkbox = document.getElementById("bookingAgree");
  continueBtn.disabled = true;

  checkbox.addEventListener("change", () => {
    continueBtn.disabled = !checkbox.checked;
  });
}

// ========================= Booking Submit =========================
bookingForm.addEventListener("submit", e=>{
  e.preventDefault();

  const agreeCheckbox = document.getElementById("bookingAgree");
  if(!agreeCheckbox?.checked){
    alert("⚠️ Please agree to the Service Statement");
    return;
  }

  if(!currentUser){
    alert("⚠️ Please login first");
    return;
  }

  const packageId = bookingModal.dataset.packageId;
  const pkg = packagesData[packageId];
  if(!pkg) return;

  const totalAmount = Number(bprice.value) || 0;
  const advanceAmount = Math.round(totalAmount * 0.2);

  const bookingData = {
    bookingID: "IMP" + Date.now(),
    userId: currentUser.uid,
    packageId,
    vendorLoginId: pkg.vendorLoginId,
    packageName: pkg.name,
    clientName: `${bfname.value} ${blname.value}`.trim(),
    clientPhone: bphone.value,
    clientEmail: currentUser.email || "",
    address: baddress.value,
    location: blocation.value,
    city: bcity.value,
    pincode: bpincode.value,
    startDate: bstartDate.value,
    endDate: bendDate.value,
    totalAmount,
    advanceAmount,
    status: "pending",
    createdAt: Date.now()
  };

  sessionStorage.setItem("checkoutData", JSON.stringify(bookingData));
  bookingForm.reset();
  bookingModal.style.display = "none";
  location.href = "checkout.html";
});

// ========================= GPS → LIVE ADDRESS =========================
async function fillCurrentAddress() {
  if (!navigator.geolocation) return;

  blocation.value = "Fetching location...";
  baddress.value = "Detecting your address...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();

        blocation.value = `${lat}, ${lon}`;
        baddress.value = data.display_name || "";
        if(data.address){
          bcity.value = data.address.city || data.address.town || data.address.village || bcity.value;
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        blocation.value = "";
        baddress.value = "";
      }
    },
    (error) => {
      console.warn("GPS permission denied");
      blocation.value = "";
      baddress.value = "";
    },
    { enableHighAccuracy:true, timeout:10000, maximumAge:0 }
  );
}

// Optional: manual use current location button
document.getElementById("getLocation")?.addEventListener("click", fillCurrentAddress);





function toggleSeo(){
  const text = document.querySelector(".seo-short");
  const btn = document.querySelector(".read-more");

  text.classList.toggle("active");

  btn.innerText = text.classList.contains("active") ? "Read Less" : "Read More";
}