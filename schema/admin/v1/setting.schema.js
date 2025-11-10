import { z } from "zod";

const timezoneEnum = z.enum([
  "Asia/Kolkata",
]);

const currencyEnum = z.enum(["INR"]);
const languageEnum = z.enum(["en"]);

export const siteSettingsSchema = z.object({
  site_settings: z
    .object({
      brand_name: z.string().optional(),
      site_name: z.string().optional(),
      site_tagline: z.string().optional(),
      timezone: timezoneEnum.optional(),
      currency: currencyEnum.optional(),
      currency_symbol: z.string().optional(),
      default_language: languageEnum.optional(),
    })
    .optional(),

  support_info: z
    .object({
      company: z.string().optional(),
      support_email: z.string().email().optional(),
      support_mobile: z.string().optional(),
      whatsapp_number: z.string().optional(),
      address: z.string().optional(),
      cin: z.string().optional(),
      registered_office: z.string().optional(),
    })
    .optional(),

  seo_settings: z
    .object({
      meta_title: z.string().optional(),
      meta_description: z.string().optional(),
      meta_keywords: z.string().optional(),
    })
    .optional(),

  homepage_settings: z
    .object({
      description: z.string().optional(),
    })
    .optional(),

  policies: z
    .object({
      terms_and_conditions: z.string().optional(),
      privacy_policy: z.string().optional(),
      return_policy: z.string().optional(),
      shipping_policy: z.string().optional(),
    })
    .optional(),

  notifications: z
    .object({
      email_notifications_enabled: z.boolean().optional(),
    })
    .optional(),
});

export const uploadLogoOrFaviconSchema = z.object({
  image: z.any().openapi({ type: "string", format: "binary" }),
  removeBg: z.coerce.boolean().openapi({ example: true }),
});

export const uploadHomePageBannerSchema = z.object({
  link: z.string().openapi({ example: "/home" }),
  image: z.any().openapi({ type: "string", format: "binary" }),
  removeBg: z.coerce.boolean().openapi({ example: true }),
});

export const uploadHomePageImageSchema = z.object({
  image: z.any().openapi({ type: "string", format: "binary" }),
  removeBg: z.coerce.boolean().openapi({ example: true }),
});
