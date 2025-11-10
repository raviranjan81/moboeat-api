import { AppError } from "../../../class/AppError.js";
import MainCategoryModel from "../../../model/main.category.model.js";
import { deleteFileIfExists } from "../../../utils/helper.js";
import { removeImageBackground } from "../../../utils/remove-background.js";
import path from "path";

export const getAllMainCategories = async (req, res, next) => {
  try {
    const categories = await MainCategoryModel.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Error in getAllMainCategories:", error);
    next(error);
  }
};

export const getMainCategoryById = async (req, res, next) => {
  try {
    const mainCat = await MainCategoryModel.findById(req.params.id);
    if (!mainCat) return next(new AppError("Main category not found", 404));

    res.json({
      success: true,
      data: mainCat,
    });
  } catch (error) {
    console.error("Error in getMainCategoryById:", error);
    next(error);
  }
};

export const createMainCategory = async (req, res, next) => {
  try {
    const { name, status, removeBg, start, end } = req.body;
    if (!req.user) {
      return next(new AppError("Unauthorised Access", 401));
    }
    const adminId = req.user.id;
    const existing = await MainCategoryModel.findOne({
      name: name.trim(),
      adminId,
    });

    if (existing) {
      return next(new AppError("Main category already exists", 400));
    }

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

    const mainCat = new MainCategoryModel({
      name: name.trim(),
      status: status ?? "Active",
      image: imagePath,
      adminId: adminId,
      start,
      end,
    });

    await mainCat.save();

    res.status(201).json({
      response: true,
      message: "Main category created successfully",
      data: mainCat,
    });
  } catch (error) {
    console.error("Error in createMainCategory:", error);
    next(error);
  }
};
export const updateMainCategory = async (req, res, next) => {
  try {
    const { name, status, removeBg, start, end } = req.body;

    const mainCat = await MainCategoryModel.findById(req.params.id);
    if (!mainCat) return next(new AppError("Main category not found", 404));

    mainCat.name = name?.trim() ?? mainCat.name;
    mainCat.start = start ?? mainCat.start;
    mainCat.end = end ?? mainCat.end;

    if (status !== undefined) mainCat.status = status;

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
          "categories",
          path.basename(mainCat.image)
        );
        deleteFileIfExists(imagePath);
      }

      const newImagePath = `uploads/categories/${finalFileName}`;
      mainCat.image = newImagePath;
    }

    await mainCat.save();

    res.json({
      response: true,
      message: "Main category updated successfully",
      data: mainCat,
    });
  } catch (error) {
    console.error("Error in updateMainCategory:", error);
    next(error);
  }
};

export const deleteMainCategory = async (req, res, next) => {
  try {
    const mainCat = await MainCategoryModel.findById(req.params.id);
    if (!mainCat) return next(new AppError("Main category not found", 404));

    if (mainCat.image) {
      const imagePath = path.join(
        "uploads",
        "categories",
        path.basename(mainCat.image)
      );

      deleteFileIfExists(imagePath);
    }

    await mainCat.deleteOne();

    res.json({
      response: true,
      message: "Main category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteMainCategory:", error);
    next(error);
  }
};
