// ---------------- FIREBASE INIT ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ---------------- CONFIG ----------------
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

// ---------------- DOM ----------------
const grid = document.querySelector(".portfolio-grid");
const heroImage = document.getElementById("heroImage");
const heroVideo = document.getElementById("heroVideo");
const heroVideoSection = document.querySelector(".hero-video");

let mediaItems = [];
let currentFilter = "all";

// ---------------- HERO ----------------
onValue(ref(db, "heroBanner"), snapshot => {
  const data = snapshot.val();
  if (!data) return;

  if (data.type === "video") {
    heroVideo.src = data.url;
    heroVideoSection.style.display = "block";
    heroImage.style.display = "none";
  } else {
    heroImage.src = data.url;
    heroImage.style.display = "block";
    heroVideoSection.style.display = "none";
  }
});

// ---------------- FETCH MEDIA ----------------
onValue(ref(db, "portfolio"), snap => {
  mediaItems = [];

  snap.forEach(item => {
    const d = item.val();
    if (!d.active) return;

    // 🔥 FIX: category detect
    const category = d.category || d.desc || "other";

    mediaItems.push({
      ...d,
      key: item.key,
      category
    });
  });

  displayMedia();
});

// ---------------- FILTER ----------------
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    displayMedia();
  });
});

// ---------------- DISPLAY ----------------
function displayMedia() {
  if (!grid) return;

  grid.innerHTML = "";

  const filtered = currentFilter === "all"
    ? mediaItems
    : mediaItems.filter(m => m.category === currentFilter);

  if(filtered.length === 0){
    grid.innerHTML = "<p style='color:white'>No media found</p>";
    return;
  }

  filtered.forEach(m => {
    const card = document.createElement("div");
    card.className = "item";

    card.innerHTML = `
      <div class="media-box">
        ${m.type === 'video'
          ? `<video src="${m.url}" muted loop preload="metadata"></video>`
          : `<img src="${m.thumb || m.url}">`}
      </div>

      <div class="info">
        <span>${m.title || m.category}</span>
        <button class="like-btn">❤ ${m.likes || 0}</button>
      </div>
    `;

    // 🎬 VIDEO HOVER
    const vid = card.querySelector("video");
    if (vid) {
      card.addEventListener("mouseenter", () => vid.play());
      card.addEventListener("mouseleave", () => vid.pause());
    }

    // ❤️ LIKE SYSTEM
    card.querySelector(".like-btn").onclick = async e => {
      e.stopPropagation();

      const userKey = localStorage.getItem("userId") || Date.now().toString();
      localStorage.setItem("userId", userKey);

      if (!m.userLikes) m.userLikes = {};

      if (m.userLikes[userKey]) {
        return alert("Already liked ❤️");
      }

      m.userLikes[userKey] = true;

      const newLikes = (m.likes || 0) + 1;
      m.likes = newLikes;

      e.target.textContent = "❤ " + newLikes;

      await update(ref(db, `portfolio/${m.key}`), {
        likes: newLikes,
        userLikes: m.userLikes
      });
    };

    // 🔍 PREVIEW
    card.onclick = () => openPreview(m);

    grid.appendChild(card);
  });
}

// ---------------- PREVIEW MODAL ----------------
function openPreview(media) {

  let modal = document.getElementById("previewModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "previewModal";
    modal.innerHTML = `
      <div class="preview-content">
        <span class="close">&times;</span>
        <div class="preview-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".close").onclick = () => modal.style.display = "none";
  }

  const body = modal.querySelector(".preview-body");

  body.innerHTML = media.type === "video"
    ? `<video src="${media.url}" controls autoplay></video>`
    : `<img src="${media.url}">`;

  modal.style.display = "flex";
}