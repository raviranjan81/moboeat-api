import { AppError } from "../../../class/AppError.js";
import ProductModel from "../../../model/product.model.js";

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
   const query = {
      ...filters,
      vendorId: { $ne: req?.user?.id }
    };

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
          path: "category",
          select: "name _id",
        })
        .populate({
          path: "subCategory",
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


export const deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));

    await ProductModel.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    next(error);
  }
};


