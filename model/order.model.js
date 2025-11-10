import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
          default: null,
        },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
          default: null,
        },
        quantity: { type: Number, default: 1 },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    subtotal: Number,
    shippingCharges: Number,
    discount: Number,
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    status: { type: String, default: "Pending", trim: true },
    totalAmount: Number,
    address: Object,
    notes: String,

    reports: [
      {
        status: { type: String, default: "Order Placed" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
          default: null,
        },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
          default: null,
        },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

        role: String,
        remark: String,
        reportedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;
