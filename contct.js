// contact.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // Input fields
  const cname = document.getElementById("cname");
  const cphone = document.getElementById("cphone");
  const ceventType = document.getElementById("ceventType");
  const ceventDate = document.getElementById("ceventDate");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Push data to Firebase
    database.ref("contactEnquiries").push({
      name: cname.value,
      phone: cphone.value,
      eventType: ceventType.value,
      eventDate: ceventDate.value,
      time: new Date().toISOString()
    })
    .then(() => {
      alert("Contact form submitted ✅");
      form.reset();
    })
    .catch((err) => {
      alert("Error: " + err.message);
    });
  });
});
