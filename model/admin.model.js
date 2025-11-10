import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    address: {
      type: String,
      required: false,
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
    type: {
      trim: true,
      enum: ["superAdmin", "adminHead", "admin"],
      required: true,
      type: String,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    moboEatAdmin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },

    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: false,
    },

    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: false,
    },

    stateId: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: false,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    corporateName: {
      type: String,
      required: false,
      trim: true,
    },
     contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
     userId: {
      type: String,
      required: false,
      unique: true,
    },
    corporateCode: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(String(enteredPassword), this.password);
};

const AdminModel = mongoose.model("Admin", adminSchema);

export default AdminModel;
