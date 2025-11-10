import mongoose from "mongoose";
const { Schema } = mongoose;

const CouponSchema = new Schema(
    {
        code: { type: String, required: true, unique: true, trim: true },
        discountType: { type: String, enum: ["percentage", "fixed"], required: true },
        discountValue: { type: Number, required: true },
        usageLimit: { type: Number },
        usedCount: { type: Number, default: 0 },
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    },
    { timestamps: true }
);

const CouponModel = mongoose.model("Coupon", CouponSchema);
export default CouponModel;


