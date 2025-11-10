import express from "express";
import { verifyToken } from "../../../middleware/user/user-auth-request.js";
import { getProductFilters, getProducts, getUserProducts } from "../../../controller/user/v1/product.controller.js";
const router = express.Router();

router.get("/getUserProducts", verifyToken, getUserProducts);
router.post("/getVendorProducts/:id",  getProducts);
router.get("/filters/:vendorId", getProductFilters);


export default router;



