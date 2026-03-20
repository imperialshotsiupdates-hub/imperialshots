import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove, set } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c",
  storageBucket: "imperialshots-d468c.firebasestorage.app",
  messagingSenderId: "819570202874",
  appId: "1:819570202874:web:06f2af78fca0a35f2d5143"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ================= CLOUDINARY CONFIG ================= */
const CLOUD = "dnpy337m4";
const PRESET = "imperialshots";

/* ================= MEDIA UPLOAD ================= */
window.uploadMedia = async (btn) => {
  const section = btn.closest(".section");
  const file = section.querySelector(".fileInput").files[0];
  const title = section.querySelector(".titleInput").value;
  const category = section.querySelector(".categoryInput").value;

  if(!file) return alert("Select a file!");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);
  fd.append("folder", "imperialshots/" + section.dataset.path);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`,
      { method:"POST", body:fd }
    );
    const data = await res.json();

    const thumb = data.secure_url.replace(
      "/upload/",
      "/upload/w_400,h_300,c_fill/"
    );

    await push(ref(db, section.dataset.path), {
      url: data.secure_url,
      thumb,
      type: data.resource_type,
      title,
      desc: category,
      active: true,
      created: Date.now()
    });

    section.querySelector(".fileInput").value = "";
    section.querySelector(".titleInput").value = "";

    alert("Media Uploaded Successfully!");
  } catch(e){
    alert("Upload failed: " + e.message);
  }
};

/* ================= DISPLAY MEDIA ================= */
document.querySelectorAll(".section").forEach(section=>{
  const path = section.dataset.path;
  const grid = section.querySelector(".media-grid");

  onValue(ref(db, path), snap => {
    grid.innerHTML = "";
    snap.forEach(item=>{
      const d = item.val();
      const key = item.key;

      const card = document.createElement("div");
      card.className = "media-card";
      card.dataset.path = path;
      card.dataset.key = key;

      card.innerHTML = `
        ${d.type==='video'
          ? `<video src="${d.url}" controls muted></video>`
          : `<img src="${d.thumb}">`
        }
        <input value="${d.title||''}" placeholder="Title">
        <textarea placeholder="Description">${d.desc||''}</textarea>
        <div class="actions">
          <button onclick="save(this)">Save</button>
          <button onclick="crop(this)">Crop</button>
          <button onclick="del(this)">Delete</button>
        </div>
        <div class="active-toggle ${d.active?'':'inactive'}"
             onclick="toggleActive(this)">
          ${d.active?'Active':'Inactive'}
        </div>
      `;

      grid.appendChild(card);
    });
  });
});

/* ================= MEDIA ACTIONS ================= */
window.save = btn => {
  const card = btn.closest(".media-card");
  update(ref(db, `${card.dataset.path}/${card.dataset.key}`), {
    title: card.querySelector("input").value,
    desc: card.querySelector("textarea").value
  });
};

window.crop = btn => {
  const card = btn.closest(".media-card");
  const img = card.querySelector("img");
  if(!img) return alert("Crop works only on images");

  const cropped = img.src.replace(
    "/upload/",
    "/upload/c_crop,w_800,h_500/"
  );

  img.src = cropped;

  update(ref(db, `${card.dataset.path}/${card.dataset.key}`), {
    thumb: cropped
  });
};

window.del = btn => {
  const card = btn.closest(".media-card");
  if(confirm("Delete permanently?")){
    remove(ref(db, `${card.dataset.path}/${card.dataset.key}`));
  }
};

window.toggleActive = btn => {
  const card = btn.closest(".media-card");
  const active = btn.classList.contains("inactive");

  btn.classList.toggle("inactive", !active);
  btn.textContent = active ? "Active" : "Inactive";

  update(ref(db, `${card.dataset.path}/${card.dataset.key}`), {
    active
  });
};

/* ================= BANNER MANAGEMENT ================= */

window.uploadBanner = async (inputId, dbPath) => {
  const fileInput = document.getElementById(inputId);
  const file = fileInput.files[0];
  if(!file) return alert("Select banner image");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);
  fd.append("folder", "imperialshots/banners");

  try{
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
      { method:"POST", body:fd }
    );
    const data = await res.json();

    await set(ref(db, dbPath), data.secure_url);

    alert("Banner Updated Successfully!");
    fileInput.value = "";
  }catch(e){
    alert("Banner upload failed: " + e.message);
  }
};