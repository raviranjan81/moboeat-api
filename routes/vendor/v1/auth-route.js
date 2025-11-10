import express from "express";
import { validate } from "../../../middleware/validator.js";
import { deleteVendor, getVendors, login, sendOtp, updateVendor } from "../../../controller/vendor/v1/auth-controller.js";
import { cleanupUploadedFile, fileHandler } from "../../../middleware/handler/file-handler.js";
import { verifyToken } from "../../../middleware/vendor/vendor-auth-request.js";
import { getMethodCommonSchema } from "../../../common/get.method.schema.js";

const router = express.Router();

router.get("/a", (req, res) => {
    res.send("Admin Auth Route is working");
});

router.post("/sendOtp", sendOtp);
router.post("/login",   login);

router.post("/getVendors", verifyToken, validate({ body: getMethodCommonSchema }), getVendors);
router.put("/:id",verifyToken,fileHandler({ folderPath: "public/uploads/vednors" }), cleanupUploadedFile, updateVendor);
router.delete("/:id", verifyToken , fileHandler({ folderPath: "public/uploads/vednors" }) , deleteVendor);


export default router;
