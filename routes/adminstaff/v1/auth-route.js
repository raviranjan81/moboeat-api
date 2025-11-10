import express from "express";
import { validate } from "../../../middleware/validator.js";
import { deleteAdmin, getAdmins, getHeadAdmins, login, register, sendOtp, updateAdmin } from "../../../controller/admin/v1/auth-controller.js";
import { registerAdminSchema } from "../../../schema/admin/v1/auth.schema.js";
import { cleanupUploadedFile, fileHandler } from "../../../middleware/handler/file-handler.js";
import { verifyToken } from "../../../middleware/adminstaff/adminstaff-auth-request.js";
import { getMethodCommonSchema } from "../../../common/get.method.schema.js";

const router = express.Router();

router.get("/a", (req, res) => {
    res.send("Admin Auth Route is working");
});

router.post("/sendOtp", sendOtp);
router.post("/login",   login);

router.post("/getAdmins", verifyToken, validate({ body: getMethodCommonSchema }), getAdmins);
router.post("/getHeadAdmins", verifyToken,  getHeadAdmins);
router.post("/register",fileHandler({ folderPath: "public/uploads/admins" }), cleanupUploadedFile, validate({body:registerAdminSchema}), register);
router.post("/create",verifyToken,fileHandler({ folderPath: "public/uploads/admins" }), cleanupUploadedFile, register);
router.put("/admin/:id",verifyToken,fileHandler({ folderPath: "public/uploads/admins" }), cleanupUploadedFile, updateAdmin);
router.delete("/:id", verifyToken , fileHandler({ folderPath: "public/uploads/admins" }) , deleteAdmin);

export default router;
