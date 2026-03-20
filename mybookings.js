/* ================= FIREBASE ================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyAvfmCKZQGxWdNUyqySV5IPk8DiFU4F23U",
  authDomain: "imperialshots-d468c.firebaseapp.com",
  databaseURL:
    "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imperialshots-d468c"
};

/* ================= INIT ================= */

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* ================= DOM ================= */

const bookingsContainer = document.getElementById("bookingsContainer");
const tabs = document.querySelectorAll(".tab");
const backBtn = document.getElementById("backBtn");

/* ================= STATE ================= */

let currentUserId = null;
let allBookings = {};
let activeStatus = "pending";

/* ================= BACK ================= */

backBtn.addEventListener("click", () => history.back());

/* ================= AUTH ================= */

onAuthStateChanged(auth, user => {

  if (!user) {
    bookingsContainer.innerHTML =
      "<p>Please login to see bookings</p>";
    return;
  }

  currentUserId = user.uid;

  onValue(ref(db, "bookings"), snap => {

    const data = snap.val() || {};

    allBookings = Object.fromEntries(
      Object.entries(data).filter(
        ([k, b]) => b.userId === currentUserId
      )
    );

    renderBookings();
  });

});

/* ================= TABS ================= */

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    activeStatus = tab.dataset.status;
    renderBookings();
  });

});

/* ================= RENDER ================= */

function renderBookings() {

  bookingsContainer.innerHTML = "";

  const filtered = Object.entries(allBookings).filter(([key, b]) => {

    if (activeStatus === "pending")
      return ["advance_paid", "mid_paid"].includes(b.status);

    if (activeStatus === "completed")
      return b.status === "completed";

    if (activeStatus === "canceled")
      return b.status === "canceled";

    return true;
  });

  if (!filtered.length) {
    bookingsContainer.innerHTML =
      "<p>No bookings found</p>";
    return;
  }

  filtered.forEach(([bookingKey, booking]) => {

    const card = document.createElement("div");
    card.className = "booking-card";

    card.innerHTML = `
      <h3>${booking.packageName}</h3>
      <p><b>Booking ID:</b> ${booking.bookingID}</p>

      <p><b>Status:</b> 
        ${
          booking.status === "mid_paid"
            ? `Mid Paid (₹${booking.midAmount})`
            : booking.status === "completed"
            ? `Completed`
            : booking.status
        }
      </p>

      ${booking.paidFinal ? `
        <p><b>Total:</b> ₹${booking.totalAmount}</p>
        <p><b>Paid:</b> ₹${booking.paidTotal}</p>
        <p><b>Remaining:</b> ₹${booking.remainingAmount}</p>
      ` : ""}

      <div class="payment-section">

        <button disabled>
          Advance Paid
        </button>

        <button class="mid-btn" ${booking.paidMid ? "disabled" : ""}>
          ${booking.paidMid ? `Mid Paid (₹${booking.midAmount})` : "Pay Mid"}
        </button>

        <button class="final-btn" ${!booking.paidMid || booking.paidFinal ? "disabled" : ""}>
          ${booking.paidFinal ? `Final Paid (₹${booking.finalAmount})` : "Pay Final"}
        </button>

        ${booking.paidFinal
          ? `<button class="invoice-btn">Download Invoice</button>`
          : ""}

      </div>
    `;

    bookingsContainer.appendChild(card);

    card.querySelector(".mid-btn")
      ?.addEventListener("click", () =>
        startSecurePayment(bookingKey, "mid")
      );

    card.querySelector(".final-btn")
      ?.addEventListener("click", () =>
        startSecurePayment(bookingKey, "final")
      );

    card.querySelector(".invoice-btn")
      ?.addEventListener("click", () =>
        generateInvoice(booking)
      );

  });
}

/* ================= SECURE PAYMENT ================= */

async function startSecurePayment(bookingId, paymentType) {

  try {

    const BACKEND_URL = "https://imperial-backend1-1.onrender.com";

    const booking = allBookings[bookingId];
    if (!booking) {
      alert("Booking not found ❌");
      return;
    }

    const response = await fetch(
      `${BACKEND_URL}/create-order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          totalAmount: booking.totalAmount,
          discount: booking.discount || 0,
          paymentType
        })
      }
    );

    if (!response.ok) {
      throw new Error("Order creation failed");
    }

    const result = await response.json();

    if (!result.success) {
      alert("Order creation failed ❌");
      return;
    }

    const options = {
      key: result.key,
      order_id: result.orderId,
      amount: result.amount,
      currency: result.currency,

      handler: async function (response) {

        try {

          const verifyRes = await fetch(
            `${BACKEND_URL}/verify-payment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
                paymentType
              })
            }
          );

          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            alert("Payment verification failed ❌");
            return;
          }

         const bookingRef = ref(db, `bookings/${bookingId}`);
const paymentRef = ref(db, `bookings/${bookingId}/payments`);

const total = Number(booking.totalAmount || 0);
const discount = Number(booking.discount || 0);
const netTotal = total - discount;

if (paymentType === "mid") {

  const midAmount = Math.round(netTotal * 0.30);

  // save payment history
  await push(paymentRef, {
    type: "mid",
    amount: midAmount,
    paymentId: response.razorpay_payment_id,
    orderId: response.razorpay_order_id,
    date: Date.now()
  });

  // update booking
  await update(bookingRef, {
    paidMid: true,
    midAmount: midAmount,
    status: "mid_paid",
    midPaidDate: Date.now()
  });

}
if (paymentType === "final") {

  const finalAmount = Math.round(netTotal * 0.50);
  const paidSoFar =
    (booking.midAmount || 0) + finalAmount;

  const remaining = netTotal - paidSoFar;

  const paymentRef = ref(db, `bookings/${bookingId}/payments`);

  // save payment history
  await push(paymentRef, {
    type: "final",
    amount: finalAmount,
    paymentId: response.razorpay_payment_id,
    orderId: response.razorpay_order_id,
    date: Date.now()
  });

  // update booking
  await update(bookingRef, {
    paidFinal: true,
    finalAmount: finalAmount,
    status: "completed",
    finalPaidDate: Date.now(),
    paidTotal: paidSoFar,
    remainingAmount: remaining
  });

}

          alert("Payment Successful ✅");
          location.reload();

        } catch (err) {
          console.error("Verification error:", err);
          alert("Payment verification failed ❌");
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("Payment error:", err);
    alert("Payment failed ❌");
  }
}

/* ================= INVOICE ================= */

function generateInvoice(booking) {

  try {

    const win = window.open("", "_blank");

    const totalAmount = Number(booking.totalAmount || 0);
    const discount = Number(booking.discount || 0);

    const baseAmount = totalAmount / 1.18;
    const gstAmount = totalAmount - baseAmount;
    const grandTotal = baseAmount + gstAmount - discount;

    const paymentDate = booking.finalPaidDate
      ? new Date(booking.finalPaidDate).toLocaleDateString()
      : new Date().toLocaleDateString();

    const invoiceNumber =
      "IMP" + (booking.bookingID?.slice(-6) || Date.now());

    const paymentMethod =
      booking.paymentMethod || "Online";

    const paymentStatus =
      booking.status === "completed"
        ? "Paid"
        : booking.status;

    const formatCurrency = (num) =>
      "₹" + Number(num).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

    win.document.write(`
    <html>
    <head>
      <title>Imperialshots-invoice- ${booking.bookingID}</title>
      <style>

        body {
          font-family: Arial, sans-serif;
          padding: 50px;
          color: #333;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .logo {
          width: 170px;
        }

        .invoice-right {
          text-align: right;
        }

        .invoice-right h1 {
          font-size: 38px;
          margin: 0;
          font-weight: bold;
        }

        .meta {
          margin-top: 10px;
          font-size: 14px;
        }

        .billing {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 40px;
        }

        table, th, td {
          border: 1px solid #ccc;
        }

        th, td {
          padding: 12px;
        }

        th {
          background: #f2f2f2;
        }

        .summary {
          margin-top: 20px;
          text-align: right;
          font-size: 18px;
          font-weight: bold;
        }

        .payment-info {
          margin-top: 20px;
          font-size: 14px;
        }

        .footer {
          margin-top: 70px;
          display: flex;
          justify-content: space-between;
        }

        .terms {
          width: 60%;
          font-size: 13px;
          line-height: 1.6;
        }

        .signature {
          width: 30%;
          text-align: right;
        }

        .stamp {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
        }

        .copyright {
          margin-top: 60px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }

      </style>
    </head>

    <body>

      <div class="header">
        <div>
          <img src="original.png" class="logo">
        </div>

        <div class="invoice-right">
          <h1>INVOICE</h1>
          <div class="meta">
            <div><b>Booking ID:</b> ${booking.bookingID}</div>
            <div><b>Invoice No:</b> ${invoiceNumber}</div>
            <div><b>VendorLoginID:</b> ${booking.vendorLoginId || "-"}</div>
            <div><b>Date:</b> ${paymentDate}</div>
          </div>
        </div>
      </div>

      <hr>

      <div class="billing">
        <div>
          <h3>Billed To</h3>
          <p><b>${booking.clientName}</b></p>
          <p>${booking.clientPhone || "-"}</p>
        </div>

        <div style="text-align:right;">
          <h3>Billed From</h3>
          <p><b>Imperial Shots</b></p>
          <p>infoimperialshots@gmail.com</p>
        </div>
      </div>

      <table>
        <tr>
          <th>Description</th>
          <th>Type</th>
          <th>Discount</th>
          <th>Amount (Base)</th>
          <th>GST 18%</th>
        </tr>

        <tr>
          <td>${booking.packageName}</td>
          <td>${booking.eventType || "-"}</td>
          <td>${formatCurrency(discount)}</td>
          <td>${formatCurrency(baseAmount)}</td>
          <td>${formatCurrency(gstAmount)}</td>
        </tr>
      </table>

      <div class="summary">
        Grand Total: ${formatCurrency(grandTotal)}
      </div>

      <div class="payment-info">
        <p><b>Status:</b> ${paymentStatus}</p>
        <p><b>Payment Method:</b> ${paymentMethod}</p>
      </div>

      <div class="footer">

        <div class="terms">
          <h4>Terms & Conditions</h4>
          <p>• Advance payment is non-refundable.</p>
          <p>• Once booking is confirmed, it cannot be cancelled.</p>
          <p>• Event date can be changed before 20–25 days prior.</p>
          <p>• Otherwise extra charges will be added.</p>
          <p>• Please read our refund & privacy policy carefully.</p>
          <p>Thank you for choosing us.</p>
        </div>

        <div class="signature">
          <img src="official-stamp-imperialshots.jpeg" class="stamp">
          <p><b>Authorized Signature</b></p>
        </div>

      </div>

      <div class="copyright">
        © 2026 ImperialShots. All Rights Reserved.
      </div>

    </body>
    </html>
    `);

    win.document.close();
    win.print();

  } catch (err) {
    console.error("Invoice error:", err);
    alert("Invoice generation failed ❌");
  }
}

  