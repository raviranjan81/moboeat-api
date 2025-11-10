import Product from "../../../model/product.model.js";
import { AppError } from "../../../class/AppError.js";
import ProductModel from "../../../model/product.model.js";
import { importOrUpdateProducts } from "../../../services/excelImportService.js";
import { deleteFileIfExists } from "../../../utils/helper.js";
import { removeImageBackground } from "../../../utils/remove-background.js";
import path from "path";

// ---------------------
// CREATE PRODUCT
// ---------------------
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      image,
      mainCategory,
      category,
      subCategory,
      adminId,
      status,
    } = req.body;

    const existing = await ProductModel.findOne({
      name: name.trim(),
      category,
      subCategory,
    });
    if (existing)
      return next(
        new AppError("Product already exists in this category/subcategory", 400)
      );

    const product = new ProductModel({
      name: name.trim(),
      description: description?.trim() ?? "",
      price,
      image: image?.trim(),
      mainCategory,
      category,
      subCategory: subCategory ?? null,
      adminId,
      status: status ?? true,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    next(error);
  }
};

// ---------------------
// GET PRODUCTS (PAGINATION + FILTER)
// ---------------------

export const getProducts = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    paginate = true,
    filters = {},
    sortField = "createdAt",
    sortOrder = "desc",
  } = req.body;

  try {
    const query = { ...filters };
    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    if (paginate) {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const totalItems = await ProductModel.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNumber);

      const products = await ProductModel.find(query)
        .populate({
          path: "mainCategory",
          select: "name _id",
        })
        .populate({
          path: "adminId",
          select: "name _id",
        })
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            page: pageNumber,
            totalPages,
            totalItems,
            perPage: limitNumber,
          },
        },
      });
    } else {
      const products = await ProductModel.find(query)
        .populate("mainCategory category subCategory adminId")
        .sort(sortOptions)
        .lean();

      res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: { products },
      });
    }
  } catch (error) {
    console.error("Error in getProducts:", error);
    next(error);
  }
};

// ---------------------
// GET SINGLE PRODUCT
// ---------------------
export const getProductById = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "mainCategory category subCategory adminId"
    );

    if (!product) return next(new AppError("Product not found", 404));

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductById:", error);
    next(error);
  }
};

// ---------------------
// UPDATE PRODUCT
// ---------------------
export const updateProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));

    const {
      name,
      description,
      price,
      image,
      mainCategory,
      category,
      subCategory,
      status,
    } = req.body;

    product.name = name?.trim() ?? product.name;
    product.description = description?.trim() ?? product.description;
    product.price = price ?? product.price;
    product.image = image?.trim() ?? product.image;
    product.mainCategory = mainCategory ?? product.mainCategory;
    product.category = category ?? product.category;
    product.subCategory = subCategory ?? product.subCategory;
    if (status !== undefined) product.status = status;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    next(error);
  }
};

// ---------------------
// DELETE PRODUCT
// ---------------------
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));

    await ProductModel.deleteOne();

    res.status(200).json({
      response: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    next(error);
  }
};

export const importProducts = async (req, res) => {
  try {
    const { mainCategory, userId, usertype } =
      req.body;
      

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const user = { _id: userId, usertype };
    const result = await importOrUpdateProducts(
      req.file.path,
      user,
      500,
      (percentage) => {
        console.log(`Progress: ${percentage}%`);
      },
      { mainCategory }
    );

    res.json({ message: "Import completed", result, response: true });
  } catch (err) {
    next(err);
  }
};


export const updateProductImage = async (req, res, next) => {
  try {
    const { description ,removeBg } = req.body;
    

    const mainCat = await ProductModel.findById(req.params.id);
    if (!mainCat) return next(new AppError("Product not found", 404));

    mainCat.description = description?.trim() ?? mainCat.description;

    if (req.file) {
      let finalFilePath = req.file.path;
      let finalFileName = req.file.filename;

      if (removeBg === true || removeBg === "true") {
        const bgRemovedPath = await removeImageBackground(finalFilePath);
        if (bgRemovedPath) {
          finalFilePath = bgRemovedPath;
          finalFileName = path.basename(bgRemovedPath);
        }
      }

      if (mainCat?.image) {
        const imagePath = path.join(
          "uploads",
          "products",
          path.basename(mainCat.image)
        );
        deleteFileIfExists(imagePath);
      }

      const newImagePath = `uploads/products/${finalFileName}`;
      mainCat.image = newImagePath;
    }

    await mainCat.save();

    res.json({
      response: true,
      message: "Product updated successfully",
      data: mainCat,
    });
  } catch (error) {
    console.error("Error in Product:", error);
    next(error);
  }
};