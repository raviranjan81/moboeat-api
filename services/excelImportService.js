import XLSX from "xlsx";
import mongoose from "mongoose";
import ProductModel from "../model/product.model.js";

const normalizeFoodType = (type) => {
  if (!type) return "";
  const val = type.trim().toLowerCase();
  if (val.includes("veg")) return "VEG";
  if (val.includes("non")) return "NONVEG";
  return val.toUpperCase();
};

const processBatch = async (batchRows, user, metadata) => {
  let inserted = 0;
  let updated = 0;

  for (const row of batchRows) {
    
    try {
      if (!row.itemNo || !row.itemName) continue;

      const serial = row.itemNo.toString().trim();
      const matchCondition = {
        itemNo: serial,
        mainCategory: metadata.mainCategory,
        ...(user.usertype === "admin" && { adminId: user._id }),
        ...(user.usertype === "vendor" && { vendorId: user._id }),
      };

      let product = await ProductModel.findOne(matchCondition);

      const normalizedCategory = (row.itemCategory || "").trim().toLowerCase();
      const normalizedFoodType = normalizeFoodType(row.food_type);

      if (!product) {
        product = new ProductModel({
          itemNo: serial,
          name: row.itemName,
          description: row.description || "",
          itemCategory: normalizedCategory,
          vendorPrice: Number(row.vendorPrice) || 0,
          gstAmount: Number(row.gstAmount) || 0,
          finalPrice: Number(row.finalPrice) || 0,
          quantity: Number(row.quantity) || 0,
          mainCategory: metadata.mainCategory,
          image: row.image || "",
          food_type: normalizedFoodType,
          adminId: user.usertype === "admin" ? user._id : null,
          vendorId: user.usertype === "vendor" ? user._id : null,
        });
        await product.save();
        inserted++;
      } else {
        product.name = row.itemName || product.name;
        product.description = row.description || product.description;
        product.itemCategory = normalizedCategory || product.itemCategory;
        product.vendorPrice = Number(row.vendorPrice) || product.vendorPrice;
        product.gstAmount = Number(row.gstAmount) || product.gstAmount;
        product.finalPrice = Number(row.finalPrice) || product.finalPrice;
        product.quantity = Number(row.quantity) || product.quantity;
        product.food_type = normalizedFoodType || product.food_type;
        product.image = row.image || product.image;
        updated++;
      }

    } catch (err) {
      console.log("⚠ Row error:", err.message);
    }
  }

  return { inserted, updated };
};

export const importOrUpdateProducts = async (filePath, user, batchSize = 500, onProgress, metadata = {}) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (!rows.length) throw new Error("Excel sheet is empty.");

    metadata.mainCategory = mongoose.isValidObjectId(metadata.mainCategory) ? metadata.mainCategory : null;
    metadata.parentCategory = mongoose.isValidObjectId(metadata.parentCategory) ? metadata.parentCategory : null;

    let inserted = 0;
    let updated = 0;
    let processedRows = 0;
    let batch = [];

    for (const row of rows) {
      batch.push(row);
      if (batch.length >= batchSize) {
        const result = await processBatch(batch, user, metadata);
        inserted += result.inserted;
        updated += result.updated;
        processedRows += batch.length;
        batch = [];

        if (onProgress) onProgress(Math.round((processedRows / rows.length) * 100));
      }
    }

    if (batch.length > 0) {
      const result = await processBatch(batch, user, metadata);
      inserted += result.inserted;
      updated += result.updated;
      processedRows += batch.length;
      if (onProgress) onProgress(100);
    }

    return { processed: processedRows, inserted, updated };
  } catch (err) {
    console.log("❌ Import error:", err.message);
    throw err;
  }
};
