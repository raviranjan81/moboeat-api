import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !products || !products.length) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const totalAmount = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    const newOrder = await Order.create({
      userId,
      products,
      totalAmount,
    });

    const payment = await Payment.create({
      userId,
      orderId: newOrder._id,
      razorpay_order_id: order.id,
      amount: totalAmount,
      currency: "INR",
      status: "Created",
    });

    newOrder.paymentId = payment._id;
    await newOrder.save();

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: totalAmount * 100,
      currency: "INR",
      dbOrderId: newOrder._id,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    if (isValid) {
      payment.razorpay_payment_id = razorpay_payment_id;
      payment.razorpay_signature = razorpay_signature;
      payment.status = "Captured";
      await payment.save();

      await Order.findByIdAndUpdate(payment.orderId, { status: "Processing" });

      return res.status(200).json({
        success: true,
        message: "Payment verified and order updated",
      });
    } else {
      payment.status = "Failed";
      await payment.save();
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

export default router;
