import XLSX from "xlsx";
import mongoose from "mongoose";
import ProductModel from "../model/product.model.js";
import CategoryModel from "../model/category.model.js";
import { ExcelImport } from "../model/excelImport.model.js";


const generateSKU = async (product) => {
  const categoryPart = (product.itemCategory || "CAT")
    .toUpperCase()
    .substring(0, 3);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${categoryPart}-${randomPart}`;
};


const getOrCreateSubCategory = async (itemCategoryName, user, metadata) => {
  try {
    if (!itemCategoryName || !itemCategoryName.trim()) return null;

    const name = itemCategoryName.trim();

    const existing = await CategoryModel.findOne({
      name: new RegExp(`^${name}$`, "i"),
      mainCategory: metadata.mainCategory,
      parentCategory: metadata.parentCategory || null,
      adminId: user._id,
    });

    if (existing) return existing._id;

    const newSub = new CategoryModel({
      name,
      mainCategory: metadata.mainCategory,
      parentCategory: metadata.parentCategory || null,
      adminId: user._id,
      status: true,
    });

    await newSub.save();
    console.log(`✅ Created new subcategory: ${name}`);
    return newSub._id;
  } catch (err) {
    console.error("Error creating subcategory:", err.message);
    return null;
  }
};


const processBatch = async (batchRows, user, importId, metadata) => {
  let inserted = 0;
  let updated = 0;

  for (const row of batchRows) {
  
    try {
      if (!row.itemNo || !row.itemName) continue;

      const serial = row.itemNo.toString().trim();

      const subCategoryId = await getOrCreateSubCategory(
        row.itemCategory,
        user,
        metadata
      );

      const matchCondition = {
        itemNo: serial,
        mainCategory: metadata.mainCategory || null,
        category: metadata.parentCategory || null,
        subCategory: subCategoryId || null,
        ...(user.usertype === "admin" && { adminId: user._id }),
        ...(user.usertype === "vendor" && { vendorId: user._id }),
      };

      let product = await ProductModel.findOne(matchCondition);
      console.log(product);
      

      if (!product) {
        product = new ProductModel({
          itemNo: serial,
          name: row.itemName,
          itemName: row.itemName,
          itemCategory: row.itemCategory,
          price: Number(row.vendorPrice) || 0,
          vendorPrice: Number(row.vendorPrice) || 0,
          gstAmount: Number(row.gstAmount) || 0,
          finalPrice: Number(row.finalPrice) || 0,
          quantity: Number(row.quantity) || 0,
          importId,
          adminId: user.usertype === "admin" ? user._id : null,
          vendorId: user.usertype === "vendor" ? user._id : null,
          mainCategory: metadata.mainCategory || null,
          category: metadata.parentCategory || null,
          subCategory: subCategoryId || null,
        });

        product.sku = await generateSKU(product);
        await product.save();
        inserted++;
      } else {
        product.itemCategory = row.itemCategory || product.itemCategory;
        product.vendorPrice = Number(row.vendorPrice) || product.vendorPrice;
        product.gstAmount = Number(row.gstAmount) || product.gstAmount;
        product.finalPrice = Number(row.finalPrice) || product.finalPrice;
        product.quantity = Number(row.quantity) || product.quantity;
        product.importId = importId;
        product.mainCategory = metadata.mainCategory || product.mainCategory;
        product.category = metadata.parentCategory || product.category;
        product.subCategory = subCategoryId || product.subCategory;

        if (!product.sku || !product.sku.trim()) {
          product.sku = await generateSKU(product);
        }

        await product.save();
        updated++;
      }
    } catch (err) {
      console.error("Error processing row:", err.message);
    }
  }

  return { inserted, updated };
};

export const importOrUpdateProducts = async (
  filePath,
  user,
  batchSize = 500,
  onProgress,
  metadata = {}
) => {
  try {
    metadata.mainCategory =
      metadata.mainCategory && mongoose.isValidObjectId(metadata.mainCategory)
        ? metadata.mainCategory
        : null;

    metadata.parentCategory =
      metadata.parentCategory && mongoose.isValidObjectId(metadata.parentCategory)
        ? metadata.parentCategory
        : null;

    metadata.subCategory =
      metadata.subCategory && mongoose.isValidObjectId(metadata.subCategory)
        ? metadata.subCategory
        : null;

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (!rows.length) throw new Error("Excel sheet is empty.");

    const excelRecord = await ExcelImport.create({
      fileName: filePath.split("/").pop(),
      totalRows: rows.length,
      category: metadata.parentCategory,
      mainCategory: metadata.mainCategory,
      subCategory: metadata.subCategory,
      userType: user.usertype,
      admin: user.usertype === "admin" ? user._id : null,
      vendor: user.usertype === "vendor" ? user._id : null,
    });

    const importId = excelRecord._id;
    const totalRows = rows.length;
    let processedRows = 0;
    let inserted = 0;
    let updated = 0;
    let batch = [];

    for (const row of rows) {
      batch.push(row);
      if (batch.length >= batchSize) {
        const result = await processBatch(batch, user, importId, metadata);
        inserted += result.inserted;
        updated += result.updated;
        processedRows += batch.length;
        batch = [];

        if (typeof onProgress === "function") {
          onProgress(Math.round((processedRows / totalRows) * 100));
        }
      }
    }

    if (batch.length > 0) {
      const result = await processBatch(batch, user, importId, metadata);
      inserted += result.inserted;
      updated += result.updated;
      processedRows += batch.length;

      if (typeof onProgress === "function") {
        onProgress(Math.round((processedRows / totalRows) * 100));
      }
    }

    await ExcelImport.findByIdAndUpdate(importId, {
      inserted,
      updated,
    });

    console.log(`✅ Import Completed: Inserted ${inserted}, Updated ${updated}`);

    return { importId, processed: processedRows, inserted, updated };
  } catch (err) {
    console.error("❌ Error importing products:", err.message);
    throw err;
  }
};
