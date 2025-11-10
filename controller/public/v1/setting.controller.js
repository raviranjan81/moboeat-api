import SiteSettingModel from "../../../model/site.setting.model.js";

export const getSiteSettings = async (req, res, next) => {
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
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
