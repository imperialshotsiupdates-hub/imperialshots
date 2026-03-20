// Bottom navigation include
document.addEventListener("DOMContentLoaded", () => {
  fetch("bottom-nav.html")
    .then(response => response.text())
    .then(data => {
      const container = document.createElement("div");
      container.innerHTML = data;
      document.body.appendChild(container);
    })
    .catch(err => console.error("Bottom nav load failed:", err));
});
