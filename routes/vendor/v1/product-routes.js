import express from "express";
import { validate } from "../../../middleware/validator.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductImage,
  getVendorOrders,
} from "../../../controller/vendor/v1/product-controller.js";
import {
  productSchema,
  productListSchema,
} from "../../../schema/vendor/v1/product.schema.js";
import { verifyToken } from "../../../middleware/vendor/vendor-auth-request.js";
import { cleanupUploadedFile, fileHandler } from "../../../middleware/handler/file-handler.js";


const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Product route is working");
});

router.post("/", verifyToken, validate({ body: productSchema }), createProduct);

router.post(
  "/getProducts",
  verifyToken,
  validate({ body: productListSchema }),
  getProducts
);

router.get("/:id", verifyToken, getProductById);

router.put(
  "/:id",
  verifyToken,
  validate({ body: productSchema }),
  updateProduct
);

router.delete("/:id", verifyToken, deleteProduct);
router.put("/product/productImage/:id",verifyToken,fileHandler({ folderPath: "public/uploads/products" }), cleanupUploadedFile,  updateProductImage); 
router.get("/vendor/orders", verifyToken, getVendorOrders);


export default router;
