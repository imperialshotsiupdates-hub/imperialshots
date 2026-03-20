import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://imperialshots-d468c-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.database();

// 🔹 Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY,
  key_secret: process.env.RZP_SECRET
});

// ================= VERIFY COUPON =================
app.post("/verify-coupon", async (req, res) => {
  const { couponCode, amount } = req.body;
  if (!couponCode || !amount) return res.status(400).json({ valid: false });

  try {
    const snap = await db.ref("coupons")
      .orderByChild("code")
      .equalTo(couponCode)
      .once("value");

    if (!snap.exists()) return res.json({ valid: false });

    let coupon;
    snap.forEach(s => { coupon = s.val(); }); // only one coupon

    if (!coupon.active || (coupon.end && Date.now() > coupon.end)) {
      return res.json({ valid: false });
    }

    let discount = coupon.type === "flat" 
      ? coupon.value 
      : Math.floor(amount * coupon.value / 100);

    const finalAmount = amount - discount;

    res.json({ valid: true, discount, finalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false });
  }
});


// ================= CREATE ORDER =================
app.post("/create-order", async (req, res) => {
  const { amount, bookingId } = req.body;
  if (!amount || !bookingId) return res.status(400).json({ error: "Invalid request" });

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,  // paise
      currency: "INR",
      receipt: bookingId
    });
    res.json({ orderId: order.id, key: process.env.RZP_KEY, amount: order.amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ================= VERIFY PAYMENT =================
app.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RZP_SECRET).update(body).digest("hex");
  if (expectedSignature !== razorpay_signature) return res.status(400).json({ success: false });

  try {
    await db.ref(`bookings/${bookingId}`).update({ status: "paid", paymentId: razorpay_payment_id, paidAt: Date.now() });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
