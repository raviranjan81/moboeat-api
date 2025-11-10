import express from "express";
import { getHomeData } from "../../../controller/public/v1/home.controller.js";
const router = express.Router();

router.get("/getHomeData", getHomeData);

export default router;