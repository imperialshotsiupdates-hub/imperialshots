require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// ✅ SIMPLE CORS (BEST)
app.use(cors());

// ✅ BODY PARSER
app.use(express.json());

/* ================= FIREBASE ADMIN ================= */

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.database();

/* ================= ENV CHECK ================= */

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay ENV variables missing!");
  process.exit(1);
}

/* ================= RAZORPAY ================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.status(200).send("🚀 Imperial Backend Running Securely");
});

/* ================= CREATE ORDER ================= */

/* ================= CREATE ORDER ================= */

app.post("/create-order", async (req, res) => {
  try {
    console.log("📥 BODY RECEIVED:", req.body);

    const { bookingId, paymentType } = req.body;

    if (!bookingId || !paymentType) {
      return res.status(400).json({
        success: false,
        error: "Missing bookingId or paymentType",
      });
    }

    let amount = 0;
    let booking;

    if (paymentType === "advance") {
      const snap = await db.ref("tempBookings/" + bookingId).once("value");
      booking = snap.val();

      if (!booking) {
        console.log("❌ Temp booking not found");
        return res.status(404).json({
          success: false,
          error: "Temp booking not found",
        });
      }

      const total = parseFloat(booking.totalAmount) || 0;
      amount = Math.round(total * 0.2);
    } else {
      const snap = await db.ref("bookings/" + bookingId).once("value");
      booking = snap.val();

      if (!booking) {
        console.log("❌ Booking not found");
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }

      const total = parseFloat(booking.totalAmount) || 0;
      const discount = parseFloat(booking.discount) || 0;
      const netTotal = total - discount;

      console.log("TOTAL:", total);
      console.log("DISCOUNT:", discount);
      console.log("NET TOTAL:", netTotal);

      if (paymentType === "mid") {
        amount = Math.round(netTotal * 0.3);
      }

      if (paymentType === "final") {
        amount = Math.round(netTotal * 0.5);
      }
    }

    if (!amount || amount <= 0) {
      console.log("❌ Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        error: "Invalid amount calculation",
      });
    }

    console.log("💰 FINAL AMOUNT:", amount);

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: bookingId,
    });

    console.log("✅ ORDER CREATED:", order.id);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("❌ CREATE ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Order creation failed",
    });
  }
});
/* ================= VERIFY PAYMENT ================= */

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      paymentType,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }

    const updates = { razorpay_payment_id };

    if (paymentType === "mid") {
      updates.paidMid = true;
      updates.status = "mid_paid";
    }

    if (paymentType === "final") {
      updates.paidFinal = true;
      updates.status = "completed";
      updates.finalPaidDate = Date.now();
    }

    await db.ref("bookings/" + bookingId).update(updates);

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Verification failed",
    });
  }
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);