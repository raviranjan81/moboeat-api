import express from "express";
import { verifyToken } from "../../../middleware/admin-auth-request.js";
import { validate } from "../../../middleware/validator.js";
import { getMethodCommonSchema } from "../../../common/get.method.schema.js";
import { createCouponSchema, updateCouponSchema } from "../../../schema/admin/v1/coupon.schema.js";
import { paramIdSchema } from "../../../common/id-validate.js";
import { createCoupon, deleteCoupon, getCoupon, updateCoupon } from "../../../controller/admin/v1/coupon.controller.js";

const router = express.Router();
router.post("/", verifyToken, validate({ body: getMethodCommonSchema }), getCoupon);
router.post("/create", verifyToken, validate({ body: createCouponSchema }), createCoupon);
router.put("/:id", verifyToken, validate({ body: updateCouponSchema, params: paramIdSchema }), updateCoupon);
router.delete("/:id", verifyToken, validate({ params: paramIdSchema }), deleteCoupon);

export default router;