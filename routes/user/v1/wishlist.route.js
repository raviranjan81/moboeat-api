import express from "express";
import { addToWishlist, getUserWishlist, removeFromWishlist } from "../../../controller/user/v1/wishlist.controller.js";
import { verifyToken } from "../../../middleware/user/user-auth-request.js";
import { validate } from "../../../middleware/validator.js";
import { addToWishlistSchema } from "../../../schema/user/wishlist.schema.js";
import { createPathParamSchema } from "../../../common/id-validate.js";
const router = express.Router();
router.get("/getWishlistItems", verifyToken, getUserWishlist);
router.post("/addToWishlist", verifyToken, validate({ body: addToWishlistSchema }), addToWishlist);
router.delete("/removeFromWishlist/:productId", verifyToken, validate({ params: createPathParamSchema('productId') }), removeFromWishlist);

export default router;



