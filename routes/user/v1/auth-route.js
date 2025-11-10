import express from "express";
import { login, register, sendOtp } from "../../../controller/user/v1/auth.controller.js";
import { validate } from "../../../middleware/validator.js";
import { loginSchema, registerSchema } from "../../../schema/user/auth.schema.js";
const router = express.Router();

router.post("/sendOtp", sendOtp);
router.post("/login",  validate({ body: loginSchema }),  login);
router.post("/register", validate({ body: registerSchema }),    register);
export default router;



