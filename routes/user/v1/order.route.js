import express from "express";
import { validate } from "../../../middleware/validator.js";
import { applyCouponSchema, confirmProductsSchema, orderCreationSchema, updateOrderSchema } from "../../../schema/user/order.schema.js";
import { applyCoupon, completeOrder, confirmOrderProducts, getOrderDetails, getOrderedProductWithAttributeDetail, getOrders, getUserOrders, updateOrder } from "../../../controller/user/v1/order.controller.js";
import { getMethodCommonSchema } from "../../../schema/common/get.method.schema.js";
import { verifyToken } from "../../../middleware/user/user-auth-request.js";
import { createPathParamSchema } from "../../../common/id-validate.js";

const router = express.Router();
router.post("/applyCoupon", verifyToken, validate({ body: applyCouponSchema }), applyCoupon);
router.put("/updateOrder/:id", verifyToken, validate({ body: updateOrderSchema, params: createPathParamSchema('id') }), updateOrder);
router.post("/completeOrder", verifyToken, validate({ body: orderCreationSchema }), completeOrder);
router.post("/confirmOrderProducts/:id", verifyToken, validate({ body: confirmProductsSchema }), confirmOrderProducts);
router.post("/getOrders", verifyToken, validate({ body: getMethodCommonSchema }), getOrders);

router.post("/getUserOrders", verifyToken, validate({ body: getMethodCommonSchema }), getUserOrders);
router.get("/getOrderedProductWithAttributeDetail/:id", verifyToken, getOrderedProductWithAttributeDetail);
router.get("/orderView/:id",  getOrderDetails);


export default router;



