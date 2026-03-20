import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase, ref, onValue, set, push, update, remove, get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ---------- AUTH CHECK ----------
const vendorLoginId = localStorage.getItem("vendorLoginId");
if(!vendorLoginId){
  window.location.href = "vendor-login.html";
}

// ---------- FIREBASE ----------
const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---------- DOM ----------
const container = document.getElementById("packagesContainer");
const modal = document.getElementById("packageModal");
const modalTitle = document.getElementById("modalTitle");

let editingPackageId = null;

// ---------- LOAD ONLY MY PACKAGES ----------
onValue(ref(db,"packages"), snap=>{
  container.innerHTML = "";

  snap.forEach(child=>{
    const p = child.val();

    if(p.vendorLoginId !== vendorLoginId) return;

    const div = document.createElement("div");
    div.className = "package-card";
    div.innerHTML = `
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
      <p>Status: ${p.status}</p>
      <button onclick="editPackage('${child.key}')">Edit</button>
      <button onclick="deletePackage('${child.key}')">Delete</button>
    `;
    container.appendChild(div);
  });
});

// ---------- OPEN MODAL ----------
window.openAddModal = ()=>{
  editingPackageId = null;
  modalTitle.innerText = "Add Package";
  modal.style.display="flex";
};

// ---------- EDIT ----------
window.editPackage = async id=>{
  editingPackageId = id;
  const snap = await get(ref(db,"packages/"+id));
  if(!snap.exists()) return;

  const p = snap.val();
  pkgName.value = p.name;
  pkgPrice.value = p.price;
  pkgStatus.value = p.status;

  modal.style.display="flex";
};

// ---------- DELETE ----------
window.deletePackage = id=>{
  if(confirm("Delete package?")){
    remove(ref(db,"packages/"+id));
  }
};

// ---------- SAVE ----------
window.savePackage = async ()=>{
  const data = {
    name: pkgName.value.trim(),
    price: Number(pkgPrice.value),
    status: pkgStatus.value,

    // 🔥 CRITICAL
    vendorLoginId: vendorLoginId,

    rating:0,
    totalRatings:0
  };

  if(editingPackageId){
    await update(ref(db,"packages/"+editingPackageId), data);
  }else{
    await set(push(ref(db,"packages")), data);
  }

  modal.style.display="none";
};

// ---------- CLOSE ----------
window.closeModal = ()=>{
  modal.style.display="none";
};
