import express from "express";
import { getMethodCommonSchema } from "../../../../common/get.method.schema.js";
import { paramIdSchema } from "../../../../common/id-validate.js";
import { createState, deleteState, getStates, getStatesByCountry, updateState } from "../../../../controller/admin/v1/address/state.controller.js";
import { verifyToken } from "../../../../middleware/admin-auth-request.js";
import { validate } from "../../../../middleware/validator.js";
import { createStateSchema } from "../../../../schema/admin/v1/address/state.schema.js";

const router = express.Router();

router.post("/", verifyToken, validate({ body: getMethodCommonSchema }), getStates);
router.post("/create", verifyToken, validate({ body: createStateSchema }), createState);
router.put("/:id", verifyToken, validate({ body: createStateSchema, params: paramIdSchema }), updateState);
router.delete("/:id", verifyToken, validate({ params: paramIdSchema }), deleteState);
router.post("/by-country", getStatesByCountry);

export default router;