// ================= ENQUIRY MODAL =================
const enquiryModal = document.getElementById("enquiryModal");
const enquiryForm = document.getElementById("enquiryForm");
const captcha = document.getElementById("captcha");

// Open / Close functions
function openEnquiry() { enquiryModal.style.display = "flex"; }
function closeEnquiry() { enquiryModal.style.display = "none"; }

// Close modal if clicked outside
window.addEventListener("click", e => {
  if (e.target === enquiryModal) enquiryModal.style.display = "none";
});

// Form submit
enquiryForm.addEventListener("submit", function(e) {
  e.preventDefault();

  if (!captcha.checked) {
    alert("Please verify captcha");
    return;
  }

  const data = {
    fname: document.getElementById("fname").value,
    lname: document.getElementById("lname").value,
    phone: document.getElementById("phone").value,
    altPhone: document.getElementById("altPhone").value,
    eventType: document.getElementById("eventType").value,
    eventDate: document.getElementById("eventDate").value,
    address: document.getElementById("address").value,
    pincode: document.getElementById("pincode").value,
    time: Date.now()
  };

  // Push to Firebase
  database.ref("enquiries").push(data)
    .then(() => {
      enquiryForm.reset();
      closeEnquiry();
      showThankYouPopup(`${data.fname} ${data.lname}`);
    })
    .catch(err => alert("Error: " + err.message));
});

// ================= THANK YOU POPUP =================
function showThankYouPopup(userName) {
  // Remove existing popup
  const existing = document.getElementById("thankPopup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "thankPopup";
  popup.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999;
  `;

  popup.innerHTML = `
    <div class="thank-box" style="
      background:#fff; padding:40px; border-radius:20px; text-align:center; max-width:400px; width:90%;
      position:relative; box-shadow:0 0 20px rgba(0,0,0,0.3);
    ">
      <h2 style="color:#27ae60; margin-bottom:15px;">🎉 Enquiry Submitted!</h2>
      <p style="margin-bottom:10px; font-weight:500;">Thank you for reaching out.</p>
      <p style="margin-bottom:15px;">Name: <b>${userName}</b></p>
      <button id="closeThank" style="
        padding:10px 20px; border:none; background:#27ae60; color:#fff; border-radius:10px; cursor:pointer; font-weight:bold;
      ">Close</button>
      <canvas id="confettiCanvas" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; border-radius:20px;"></canvas>
    </div>
  `;

  document.body.appendChild(popup);

  // Close button
  popup.querySelector("#closeThank").onclick = () => popup.remove();

  // Confetti
  const canvas = popup.querySelector("#confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const confetti = [];
  const confettiCount = 100;
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random()*360},100%,50%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  function drawConfetti() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    confetti.forEach(c => {
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r/2, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r/2);
      ctx.stroke();
    });
    confetti.forEach(c => {
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(c.d) + 3 + c.r/2)/2;
      c.x += Math.sin(c.d);
      c.tilt = Math.sin(c.tiltAngle) * 15;
      if (c.y > canvas.height) {
        c.y = -10;
        c.x = Math.random() * canvas.width;
      }
    });
  }

  const confettiInterval = setInterval(drawConfetti, 20);

  setTimeout(() => {
    popup.remove();
    clearInterval(confettiInterval);
  }, 5000);
}
