import { AppError } from "../../../class/AppError.js";
import CategoryModel from "../../../model/category.model.js";
import path from "path";
import { deleteFileIfExists } from "../../../utils/helper.js";
import { removeImageBackground } from "../../../utils/remove-background.js";

export const createCategory = async (req, res, next) => {
  try {
    
    
    const { name, mainCategory, parentCategory, status,removeBg } = req.body;
    const adminId = req.user.id;

    const existing = await CategoryModel.findOne({
      name: name.trim(),
      mainCategory,
      parentCategory: parentCategory || null,
      adminId,
    });

    if (existing) return next(new AppError("Category already exists", 400));

    if (!req.file) {
      throw new AppError("Image is required", 400);
    }

    let finalFilePath = req.file.path;
    let finalFileName = req.file.filename;

    if (removeBg === true || removeBg === "true") {
      const bgRemovedPath = await removeImageBackground(finalFilePath);
      if (bgRemovedPath) {
        finalFilePath = bgRemovedPath;
        finalFileName = path.basename(bgRemovedPath);
      }
    }

    const imagePath = `uploads/categories/${finalFileName}`;

    const category = new CategoryModel({
      name: name.trim(),
      mainCategory,
      image: imagePath,
      parentCategory: parentCategory || null,
      status: status ?? true,
      adminId,
    });

    await category.save();

    res.status(201).json({
      response: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error in createCategory:", error);
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
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
    const sortOptions = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    if (paginate) {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const totalRecord = await CategoryModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const categories = await CategoryModel.find(query)
        .populate("mainCategory adminId parentCategory")
        .populate({
          path: "subcategories",
          populate: { path: "adminId mainCategory parentCategory" },
        })
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      res.json({
        response: true,
        data: {
          categories,
          pagination: {
            page: pageNumber,
            totalPages,
            totalItems: totalRecord,
            perPage: limitNumber,
            skipping: (pageNumber - 1) * limitNumber,
          },
        },
      });
    } else {
      
      const categories = await CategoryModel.find(query)
        .populate("mainCategory adminId")
        .populate({
          path: "subcategories",
          populate: { path: "adminId mainCategory" },
        })
        .sort(sortOptions)
        .lean();

      res.json({
        response: true,
        message: "Categories fetched successfully",
        data: {categories},
      });
    }
  } catch (error) {
    console.error("Error in getCategories:", error);
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id)
      .populate("mainCategory adminId")
      .populate({
        path: "subcategories",
        populate: { path: "adminId mainCategory" },
      });

    if (!category) return next(new AppError("Category not found", 404));

    res.json({
      response: true,
      data: category,
    });
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, status, mainCategory, parentCategory, removeBg } = req.body;

    const category = await CategoryModel.findById(req.params.id);
    if (!category) return next(new AppError("Category not found", 404));

    category.name = name?.trim() ?? category.name;
    category.status = status ?? category.status;
    category.mainCategory = mainCategory ?? category.mainCategory;
    if (parentCategory !== undefined) {
      category.parentCategory = parentCategory;
    }

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

      if (category.image) {
        deleteFileIfExists(category.image);
      }

      const newImagePath = `uploads/categories/${finalFileName}`;
      category.image = newImagePath;
    }

    await category.save();

    res.json({
      response: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    next(error);
  }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return next(new AppError("Category not found", 404));

    if (category.image) {
      deleteFileIfExists(category.image);
    }

    const subcategories = await CategoryModel.find({
      parentCategory: category._id,
    });

    for (const sub of subcategories) {
      if (sub.image) {
        deleteFileIfExists(sub.image);
      }
    }

    await CategoryModel.deleteMany({ parentCategory: category._id });

    await category.deleteOne();

    res.json({
      response: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    next(error);
  }
};
