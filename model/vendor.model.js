import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const vendorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,

    },

    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    stateId: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },

    corporateName: {
      type: String,
      required: true,
      trim: true,
    },
    corporateCode: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },

    vendorType: {
      type: String,
      enum: ["superVendor", "Vendor"],
      trim: true,
    },

    logo: {
      type: String,
      default: false,
    },
    password: {
      type: String,
      required: false,
      default: "",
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    isSuperVendor: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.pre("save", async function (next) {
  const vendor = this;
  if (!vendor.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    vendor.password = await bcrypt.hash(vendor.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const VendorModel = mongoose.model("Vendor", vendorSchema);
export default VendorModel;
