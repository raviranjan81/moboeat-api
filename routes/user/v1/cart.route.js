import express from "express";
import { verifyToken } from "../../../middleware/user/user-auth-request.js";
import { addToCart, getUserCart, removeFromCart } from "../../../controller/user/v1/cart.controller.js";
import { addToCartSchema } from "../../../schema/user/cart.schema.js";
import { validate } from "../../../middleware/validator.js";
import { createPathParamSchema } from "../../../common/id-validate.js";

const router = express.Router();
router.get("/getCartItems", verifyToken, getUserCart);
router.post("/addToCart", verifyToken, validate({ body: addToCartSchema }), addToCart);
router.delete("/removeFromCart/:productId", verifyToken, validate({ params: createPathParamSchema('productId') }), removeFromCart);

export default router;



