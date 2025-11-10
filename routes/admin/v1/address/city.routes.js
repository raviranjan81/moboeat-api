import express from "express";
import { getMethodCommonSchema } from "../../../../common/get.method.schema.js";
import { paramIdSchema } from "../../../../common/id-validate.js";
import { createCity, deleteCity, getCities, getCityByState, updateCity } from "../../../../controller/admin/v1/address/city.controller.js";
import { verifyToken } from "../../../../middleware/admin-auth-request.js";
import { validate } from "../../../../middleware/validator.js";
import { createCitySchema } from "../../../../schema/admin/v1/address/city.schema.js";


const router = express.Router();

router.post("/", verifyToken, validate({ body: getMethodCommonSchema }), getCities);
router.post("/create", verifyToken, validate({ body: createCitySchema }), createCity);
router.put("/:id", verifyToken, validate({ body: createCitySchema, params: paramIdSchema }), updateCity);
router.delete("/:id", verifyToken, validate({ params: paramIdSchema }), deleteCity);

router.post("/by-state", getCityByState);
export default router;