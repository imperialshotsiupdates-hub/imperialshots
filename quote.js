// ================= QUOTE MODAL LOGIC =================
const quoteBtn = document.querySelectorAll(".quote-btn"); 
const quoteModal = document.getElementById("quoteModal");
const closeQuote = document.getElementById("closeQuote");
const quoteForm = document.getElementById("quoteForm");

// Open modal on any quote button click
quoteBtn.forEach(btn => {
  btn.addEventListener("click", () => {
    quoteModal.style.display = "flex";
  });
});

// Close modal with X button
closeQuote.addEventListener("click", () => {
  quoteModal.style.display = "none";
});

// Close modal if clicked outside modal box
window.addEventListener("click", (e) => {
  if (e.target === quoteModal) {
    quoteModal.style.display = "none";
  }
});

// ================= QUOTE FORM SUBMIT =================
quoteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Captcha validation
  const captcha = document.getElementById("qcaptcha");
  if (!captcha.checked) {
    alert("Please verify captcha");
    return;
  }

  // Collect form data
  const quoteData = {
    firstName: document.getElementById("qfname").value.trim(),
    lastName: document.getElementById("qlname").value.trim(),
    email: document.getElementById("qemail").value.trim(),
    phone: document.getElementById("qphone").value.trim(),
    altPhone: document.getElementById("qaltphone").value.trim(),
    package: document.getElementById("qpackage").value.trim(),
    eventType: document.getElementById("qeventType").value,
    eventDate: document.getElementById("qeventDate").value,
    address: document.getElementById("qaddress").value.trim(),
    city: document.getElementById("qcity").value.trim(),
    pincode: document.getElementById("qpincode").value.trim(),
    message: document.getElementById("qmessage").value.trim(),
    createdAt: new Date().toISOString()
  };

  // Push to Firebase
  firebase.database().ref("quotes").push(quoteData)
    .then(() => {
      quoteForm.reset();
      quoteModal.style.display = "none";
      showThankYouPopup(`${quoteData.firstName} ${quoteData.lastName}`);
    })
    .catch(err => alert("Error: " + err.message));
});

// ================= THANK YOU POPUP =================
function showThankYouPopup(userName) {
  // Remove existing popup if any
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
      <h2 style="color:#27ae60; margin-bottom:15px;">🎉 Quote Request Submitted!</h2>
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  // Auto remove popup after 5 seconds
  setTimeout(() => {
    popup.remove();
    clearInterval(confettiInterval);
  }, 5000);
}
