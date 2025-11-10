import mongoose from "mongoose";

const MainCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    start: { type: String, required: true, trim: true },
    end: { type: String, required: true, trim: true },
    image: { type: String, required: false },
    status: { type: String, default: true, default: true },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const MainCategoryModel = mongoose.model("MainCategory", MainCategorySchema);
export default MainCategoryModel;
