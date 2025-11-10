import express from "express";
import { validate } from "../../../middleware/validator.js";
import { verifyToken } from "../../../middleware/admin-auth-request.js";
import { getMethodCommonSchema } from "../../../common/get.method.schema.js";
import { createVendorSchema, updateVendorSchema } from "../../../schema/admin/v1/vendor.schema.js";
import { cleanupUploadedFile, fileHandler } from "../../../middleware/handler/file-handler.js";
import { createVendor, deleteVendor, getHeadVendors, getVendors, getVendorsStaff, updateVendor } from "../../../controller/admin/v1/vendor.controller.js";
import { paramIdSchema } from "../../../common/id-validate.js";

const router = express.Router();

router.post("/", verifyToken, validate({ body: getMethodCommonSchema }), getVendors);
router.post("/getHeadVendors", verifyToken, validate({ body: getMethodCommonSchema }), getHeadVendors);
router.post("/getStaffVendors", verifyToken, validate({ body: getMethodCommonSchema }), getVendorsStaff);
router.post("/create", verifyToken,fileHandler({ folderPath: "public/uploads/vendors" }), cleanupUploadedFile, validate({ body: createVendorSchema }), createVendor);
router.delete("/:id", verifyToken, validate({ params: paramIdSchema }), deleteVendor);
router.put("/:id", verifyToken,fileHandler({ folderPath: "public/uploads/vendors" }), cleanupUploadedFile,  updateVendor);

export default router