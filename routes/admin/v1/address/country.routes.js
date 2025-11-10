import express from "express";
import { validate } from "../../../../middleware/validator.js";
import { getMethodCommonSchema } from "../../../../common/get.method.schema.js";
import { createCountry, deleteCountry, getCountries, updateCountry } from "../../../../controller/admin/v1/address/country.controller.js";
import { createCountrySchema } from "../../../../schema/admin/v1/address/country.schema.js";
import { paramIdSchema } from "../../../../common/id-validate.js";
import { verifyToken } from "../../../../middleware/admin-auth-request.js";
const router = express.Router();

router.post("/", verifyToken, validate({ body: getMethodCommonSchema }), getCountries);
router.post("/create", verifyToken, validate({ body: createCountrySchema }), createCountry);
router.put("/:id", verifyToken, validate({ body: createCountrySchema, params: paramIdSchema }), updateCountry);
router.delete("/:id", verifyToken, validate({ params: paramIdSchema }), deleteCountry);

export default router;