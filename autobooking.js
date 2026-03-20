// Booking Modal Logic
const bookBtns = document.querySelectorAll(".book-btn");
const bookingModal = document.getElementById("bookingModal");
const closeBookingBtn = document.getElementById("closeBooking");
const bpackageInput = document.getElementById("bpackage");

bookBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const packageName = card.dataset.package;
    bpackageInput.value = packageName;
    bookingModal.style.display = "flex";
  });
});

closeBookingBtn.addEventListener("click", () => {
  bookingModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === bookingModal) bookingModal.style.display = "none";
});

// Booking Form Submit to Firebase
document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const bookingData = {
    fname: document.getElementById("bfname").value,
    lname: document.getElementById("blname").value,
    phone: document.getElementById("bphone").value,
    date: document.getElementById("bdate").value,
    city: document.getElementById("bcity").value,
    package: document.getElementById("bpackage").value,
    createdAt: new Date().toISOString()
  };
  firebase.database().ref("bookings").push(bookingData)
    .then(() => {
      alert("Booking Submitted ✅");
      document.getElementById("bookingForm").reset();
      bookingModal.style.display = "none";
    });
});




