document.addEventListener("DOMContentLoaded", () => {
  fetch("bottom-nav.html")  // common HTML file
    .then(response => response.text())
    .then(data => {
      const container = document.createElement("div");
      container.innerHTML = data;
      document.body.appendChild(container);

      // Current page highlight
      const currentPage = window.location.pathname.split("/").pop();
      const links = container.querySelectorAll("a");
      links.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
          link.classList.add("active");
        }
      });
    })
    .catch(err => console.error("Bottom nav load failed:", err));
});
