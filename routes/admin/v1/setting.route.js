import express from "express";

import { verifyToken } from "../../../middleware/admin-auth-request.js";
import { validate } from "../../../middleware/validator.js";
import { createPathParamSchema, paramIdSchema } from "../../../common/id-validate.js";
import { siteSettingsSchema, uploadHomePageBannerSchema, uploadLogoOrFaviconSchema } from "../../../schema/admin/v1/setting.schema.js";
import { cleanupUploadedFile, fileHandler } from "../../../middleware/handler/file-handler.js";
import { deleteHomepageBanner, getSiteSettings, updateHomePageBanner, updateSiteSettings, uploadFavicon, uploadHomepageBanner, uploadLogo, uploadOpenGraphImage } from "../../../controller/admin/v1/site.settings.controller.js";
import { getServerInfo } from "../../../controller/admin/v1/server.controller.js";

const router = express.Router();


router.get("/serverInfo", verifyToken, getServerInfo);
router.get("/siteSetting", verifyToken, getSiteSettings);
router.put("/siteSetting", verifyToken, validate({ body: siteSettingsSchema }), updateSiteSettings);
router.post("/siteSetting/upload/logo", verifyToken, fileHandler({ folderPath: "public", filename: 'logo' }), cleanupUploadedFile, validate({ body: uploadLogoOrFaviconSchema }), uploadLogo);
router.post("/siteSetting/upload/favicon", verifyToken, fileHandler({ folderPath: "public", filename: 'favicon' }), cleanupUploadedFile, validate({ body: uploadLogoOrFaviconSchema }), uploadFavicon);
router.post("/siteSetting/upload/openGraphImage", verifyToken, fileHandler({ folderPath: "public", filename: 'open-graph' }), cleanupUploadedFile, validate({ body: uploadLogoOrFaviconSchema }), uploadOpenGraphImage);
router.post("/siteSetting/upload/homePageBanner", verifyToken, fileHandler({ folderPath: "public/uploads/banners" }), cleanupUploadedFile, validate({ body: uploadHomePageBannerSchema }), uploadHomepageBanner);
router.put("/siteSetting/upload/homePageBanner/:imageId", verifyToken, fileHandler({ folderPath: "public/uploads/banners" }), cleanupUploadedFile, validate({ body: uploadHomePageBannerSchema, params: createPathParamSchema('imageId') }), updateHomePageBanner);
router.delete("/siteSetting/homePageBanner/:id", verifyToken, validate({ params: paramIdSchema }), deleteHomepageBanner);



export default router;



