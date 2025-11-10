import express from "express";
import { getProducts, searchProducts } from "../../../controller/public/v1/product.controller.js";

const router = express.Router();

router.post("/getProduct", getProducts);
router.get("/searchProducts", searchProducts);

export default router
