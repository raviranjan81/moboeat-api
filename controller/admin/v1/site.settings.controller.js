import path from "path";
import fs from "fs";
import SiteSettingModel from "../../../model/site.setting.model.js";
import { AppError } from "../../../class/AppError.js";


export const getSiteSettings = async (_req, res, next) => {
  try {
    const settings = await SiteSettingModel.findOne();
    res.status(200).json({
      response: true,
      data: {
        settings: settings || {
          site_settings: {},
          support_info: {},
          seo_settings: {},
          homepage_settings: {},
          policies: {},
          notifications: {},
          pages: {},
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updateSiteSettings = async (req, res, next) => {
  try {
    const {
      site_settings,
      support_info,
      seo_settings,
      homepage_settings,
      policies,
      notifications,
      founder_info,
      pages,
    } = req.body;

    const updateData = {};

    const mergeData = async (fieldName, newData) => {
      const existingData = await SiteSettingModel.findOne({});
      const currentFieldData = existingData ? existingData[fieldName] : {};
      return { ...currentFieldData, ...newData };
    };


    if (site_settings) updateData["site_settings"] = site_settings;
    if (pages) updateData["pages"] = pages;
    if (support_info) updateData["support_info"] = support_info;
    if (seo_settings) updateData["seo_settings"] = seo_settings;
    if (homepage_settings) updateData["homepage_settings"] = homepage_settings;
    if (policies) updateData["policies"] = policies;
    if (notifications) updateData["notifications"] = notifications;

    if (founder_info) {
      updateData["founder_info"] = await mergeData("founder_info", founder_info);
    }

    const fieldsToMerge = [
      "site_settings",
      "support_info",
      "seo_settings",
      "homepage_settings",
      "policies",
      "notifications",
    ];

    for (let field of fieldsToMerge) {
      if (req.body[field]) {
        updateData[field] = await mergeData(field, req.body[field]);
      }
    }

    const updated = await SiteSettingModel.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      response: true,
      message: "Site settings updated successfully",
      data: { settings: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }

    const { removeBg } = req.body;
    let finalFilePath = req.file.path;
    let finalFileName = req.file.filename;

    if (removeBg === true || removeBg === "true") {
      const bgRemovedPath = await removeImageBackground(finalFilePath);
      if (bgRemovedPath) {
        finalFilePath = bgRemovedPath;
        finalFileName = path.basename(bgRemovedPath);
      }
    }

    const imagePath = `${finalFileName}`;
    const updateField = { "site_settings.site_logo": imagePath };

    await SiteSettingModel.findOneAndUpdate({}, { $set: updateField }, { new: true, upsert: true });

    res.status(200).json({
      response: true,
      message: `Logo uploaded successfully`,
      data: { url: imagePath },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadFavicon = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }

    const { removeBg } = req.body;
    let finalFilePath = req.file.path;
    let finalFileName = req.file.filename;

    if (removeBg === true || removeBg === "true") {
      const bgRemovedPath = await removeImageBackground(finalFilePath);
      if (bgRemovedPath) {
        finalFilePath = bgRemovedPath;
        finalFileName = path.basename(bgRemovedPath);
      }
    }

    const imagePath = `${finalFileName}`;
    const updateField = { "site_settings.site_favicon": imagePath };

    const updated = await SiteSettingModel.findOneAndUpdate({}, { $set: updateField }, { new: true, upsert: true });

    res.status(200).json({
      response: true,
      message: `Favicon uploaded successfully`,
      data: { url: imagePath },
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------
// Upload Open Graph Image
// ----------------------
export const uploadOpenGraphImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }

    const { removeBg } = req.body;
    let finalFilePath = req.file.path;
    let finalFileName = req.file.filename;

    if (removeBg === true || removeBg === "true") {
      const bgRemovedPath = await removeImageBackground(finalFilePath);
      if (bgRemovedPath) {
        finalFilePath = bgRemovedPath;
        finalFileName = path.basename(bgRemovedPath);
      }
    }

    const imagePath = `${finalFileName}`;
    const updateField = { "seo_settings.og_image": imagePath };

    const updated = await SiteSettingModel.findOneAndUpdate({}, { $set: updateField }, { new: true, upsert: true });

    res.status(200).json({
      response: true,
      message: `OG Image uploaded successfully`,
      data: { url: imagePath },
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------
// Upload Homepage Banner
// ----------------------
export const uploadHomepageBanner = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError("Banner image is required", 400));

    const link = req.body.link || "/";
    const { removeBg } = req.body;
    let finalFilePath = req.file.path;
    let finalFileName = req.file.filename;

    if (removeBg === true || removeBg === "true") {
      const bgRemovedPath = await removeImageBackground(finalFilePath);
      if (bgRemovedPath) {
        finalFilePath = bgRemovedPath;
        finalFileName = path.basename(bgRemovedPath);
      }
    }

    const imagePath = `uploads/banners/${finalFileName}`;
    const banner = { image: imagePath, link };

    const updated = await SiteSettingModel.findOneAndUpdate(
      {},
      { $push: { "homepage_settings.homepage_banners": banner } },
      { new: true, upsert: true }
    );

    const addedBanner = updated?.homepage_settings?.homepage_banners.slice(-1)[0];

    res.status(200).json({
      response: true,
      message: "Banner uploaded successfully",
      data: { banner: addedBanner },
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------
// Update Homepage Banner
// ----------------------
export const updateHomePageBanner = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError("Banner image is required", 400));

    const link = req.body.link || "/";
    const { removeBg } = req.body;
    const { imageId } = req.params;

    let finalFilePath = req.file.path;
    let finalFileName = req.file.filename;

    if (removeBg === true || removeBg === "true") {
      const bgRemovedPath = await removeImageBackground(finalFilePath);
      if (bgRemovedPath) {
        finalFilePath = bgRemovedPath;
        finalFileName = path.basename(bgRemovedPath);
      }
    }

    const imagePath = `uploads/banners/${finalFileName}`;

    const current = await SiteSettingModel.findOne(
      { "homepage_settings.homepage_banners._id": imageId },
      { "homepage_settings.homepage_banners.$": 1 }
    );

    const currentBanner = current?.homepage_settings?.homepage_banners?.[0];
    const currentImagePath = currentBanner?.image;

    const updated = await SiteSettingModel.findOneAndUpdate(
      { "homepage_settings.homepage_banners._id": imageId },
      {
        $set: {
          "homepage_settings.homepage_banners.$.image": imagePath,
          "homepage_settings.homepage_banners.$.link": link,
        },
      },
      { new: true }
    );

    if (currentImagePath) {
      const absolutePath = path.join(process.cwd(), "public", currentImagePath);
      fs.unlink(absolutePath, (err) => {
        if (err) console.warn("Failed to delete old image:", err.message);
      });
    }

    const addedBanner = updated?.homepage_settings?.homepage_banners.slice(-1)[0];

    res.status(200).json({
      response: true,
      message: "Banner updated successfully",
      data: { banner: addedBanner },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHomepageBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(new AppError("Banner ID is required", 400));

    const siteSetting = await SiteSettingModel.findOne({ "homepage_settings.homepage_banners._id": id });
    const banner = siteSetting?.homepage_settings?.homepage_banners.find(
      (b) => b._id.toString() === id
    );

    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }

    if (banner.image) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "banners",
        path.basename(banner.image)
      );
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (_) {}
    }

    const updated = await SiteSettingModel.findOneAndUpdate(
      {},
      { $pull: { "homepage_settings.homepage_banners": { _id: id } } },
      { new: true }
    );

    res.status(200).json({
      response: true,
      message: "Banner deleted successfully",
      data: { banners: updated?.homepage_settings?.homepage_banners },
    });
  } catch (error) {
    next(error);
  }
};
