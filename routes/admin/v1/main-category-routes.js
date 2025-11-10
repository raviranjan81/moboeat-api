import express from "express";
import { validate } from "../../../middleware/validator.js";
import {
  createMainCategory,
  getAllMainCategories,
  getMainCategoryById,
  updateMainCategory,
  deleteMainCategory
} from "../../../controller/admin/v1/main-category-controller.js";

import { mainCategorySchema } from "../../../schema/admin/v1/main-category.schema.js";
import { verifyToken } from "../../../middleware/admin-auth-request.js";
import { cleanupUploadedFile, fileHandler } from "../../../middleware/handler/file-handler.js";
import { getMethodCommonSchema } from "../../../common/get.method.schema.js";

const router = express.Router();

router.get("/test", (req, res) => res.send("Main Category Route working"));

router.post("/create",verifyToken,fileHandler({ folderPath: "public/uploads/categories" }), cleanupUploadedFile,  validate({ body: mainCategorySchema }), createMainCategory); 
router.post("/",verifyToken,validate({ body: getMethodCommonSchema }), getAllMainCategories);                                         
router.get("/:id",verifyToken, getMainCategoryById);                                        
router.put("/:id",verifyToken,fileHandler({ folderPath: "public/uploads/categories" }), cleanupUploadedFile, validate({ body: mainCategorySchema }), updateMainCategory); 
router.delete("/:id",verifyToken, deleteMainCategory);                                      

export default router;
