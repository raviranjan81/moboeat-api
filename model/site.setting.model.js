import mongoose, {Mongoose, Schema} from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    site_settings: {
      site_name: { type: String },
      brand_name: { type: String },
      site_tagline: { type: String },
      site_logo: { type: String },
      site_favicon: { type: String },
      timezone: { type: String },
      currency: { type: String },
      currency_symbol: { type: String },
      default_language: { type: String },
    },

    support_info: {
      company: { type: String },
      support_email: { type: String },
      support_mobile: { type: String },
      whatsapp_number: { type: String },
      address: { type: String },
      cin: { type: String },
      registered_office: { type: String },
    },

    seo_settings: {
      meta_title: { type: String },
      meta_description: { type: String },
      meta_keywords: { type: String },
      og_image: { type: String },
    },

    homepage_settings: {
      homepage_banners: [
        {
          image: { type: String },
          link: { type: String },
        },
      ],
      show_featured_brands: { type: Boolean },
      show_featured_categories: { type: Boolean },
      show_recent_upload: { type: Boolean },
    },

    policies: {
      terms_and_conditions: { type: String },
      privacy_policy: { type: String },
      return_policy: { type: String },
      shipping_policy: { type: String },
    },

    pages: {
      about_us: { type: String },
      contact_us: { type: String },
    },

    notifications: {
      email_notifications_enabled: { type: Boolean },
      sms_notifications_enabled: { type: Boolean },
      notify_admin_on_order: { type: Boolean },
      notify_user_on_order_status_change: { type: Boolean },
    },
  },
  { timestamps: true }
);



const SiteSettingModel = mongoose.model("SiteSetting", SiteSettingsSchema,"site_settings");
export default SiteSettingModel;

