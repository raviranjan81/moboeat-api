import mongoose, { Schema } from "mongoose";
const userOtpSchema = new Schema(
  {
    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
      trim: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const UserOtpModel = mongoose.model("UserOtp", userOtpSchema);
export default UserOtpModel;
