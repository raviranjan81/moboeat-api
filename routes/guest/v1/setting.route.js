import express from "express";
import { getSiteSettings } from "../../../controller/public/v1/setting.controller.js";
const router = express.Router();

router.get("/siteSetting", getSiteSettings);

export default router;