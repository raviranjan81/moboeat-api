import mongoose from "mongoose";

const excelImportSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    inserted: {
      type: Number,
      default: 0,
    },
    updated: {
      type: Number,
      default: 0,
    },
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
      required: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      required: false,

    },

    userType: {
      type: String,
      enum: ["admin", "vendor"],
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
  },
  { timestamps: true }
);

export const ExcelImport = mongoose.model("ExcelImport", excelImportSchema);
