import express from "express";
import { validate } from "../../../middleware/validator.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  importProducts,
  updateProductImage,
} from "../../../controller/admin/v1/product-controller.js";
import {
  productSchema,
  productListSchema,
} from "../../../schema/admin/v1/product.schema.js";
import { verifyToken } from "../../../middleware/admin-auth-request.js";
import {
  cleanupUploadedFile,
  fileHandler,
} from "../../../middleware/handler/file-handler.js";
import {
  cleanupExcelFile,
  excelFileHandler,
} from "../../../middleware/handler/excelFileHandler.js";

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
router.post(
  "/product-import",
  verifyToken,
  excelFileHandler({
    folderPath: "public/uploads/excel",
    fieldName: "file",
  }),
  cleanupExcelFile,
  importProducts
);

router.put("/productImage/:id",verifyToken,fileHandler({ folderPath: "public/uploads/products" }), cleanupUploadedFile,  updateProductImage); 


export default router;
