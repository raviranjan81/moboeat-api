import express from "express";
import { validate } from "../../../middleware/validator.js";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../../../controller/admin/v1/category-controller.js";

import { categorySchema, categoryListSchema } from "../../../schema/admin/v1/category.schema.js";
import { verifyToken } from "../../../middleware/admin-auth-request.js";
import { cleanupUploadedFile, fileHandler } from "../../../middleware/handler/file-handler.js";
import { getMethodCommonSchema } from "../../../common/get.method.schema.js";

const router = express.Router();

router.get("/test", (req, res) => res.send("Category Route working"));

router.post("/create",verifyToken,fileHandler({ folderPath: "public/uploads/categories" }), cleanupUploadedFile,  validate({ body: categorySchema }), createCategory); 
router.post("/",verifyToken,validate({ body: getMethodCommonSchema }), getCategories);
router.post("/list",verifyToken, validate({ body: categoryListSchema }), getCategories);
router.get("/:id",verifyToken, getCategoryById);
router.put("/:id",verifyToken,fileHandler({ folderPath: "public/uploads/categories" }), cleanupUploadedFile,  validate({ body: categorySchema }), updateCategory);
router.delete("/:id",verifyToken, deleteCategory);

export default router;
