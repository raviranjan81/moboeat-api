import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    itemNo: {
      type: String,
      required: true,
      trim: true,
    },
    food_type  : {type:String , trim:true},
    itemCategory: { type: String, trim: true },
    vendorPrice: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },

    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
    },
    image: { type: String, required: false, trim: true },

  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
