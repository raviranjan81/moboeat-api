import { BRAND_NAME, SUPPORT_EMAIL } from "../../../utils/constant";

export const getDashboardDataSwaggerResponse = {
  description: "Dashboard data fetched successfully",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          response: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "object",
            properties: {
              metrics: {
                type: "object",
                properties: {
                  products: { type: "number", example: 1250 },
                  orders: { type: "number", example: 548 },
                  users: { type: "number", example: 89 },
                  revenue: { type: "string", example: "12560.00" },
                  commissions: { type: "string", example: "1890.00" },
                  partners: { type: "number", example: 24 },
                },
              },
              salesData: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Jan" },
                    sales: { type: "number", example: 4000 },
                    orders: { type: "number", example: 240 },
                  },
                },
              },
              categoryData: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Mobile Phone" },
                    products: { type: "number", example: 120 },
                  },
                },
              },
              recentOrders: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "#ORD-001" },
                    customer: { type: "string", example: "John Doe" },
                    amount: { type: "string", example: "$120.00" },
                    status: { type: "string", example: "Delivered" },
                    date: { type: "string", example: "14 Jun 2025" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const serverInfoSwaggerSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: {
      type: "object",
      properties: {
        info: {
          type: "object",
          properties: {
            hostname: { type: "string", example: "my-server" },
            platform: { type: "string", example: "linux" },
            osType: { type: "string", example: "Linux" },
            osRelease: { type: "string", example: "5.4.0-91-generic" },
            architecture: { type: "string", example: "x64" },
            uptime: { type: "string", example: "12h 34m 56s" },
            nodeVersion: { type: "string", example: "v18.16.0" },
            totalMemory: { type: "string", example: "8.00 GB" },
            freeMemory: { type: "string", example: "3.50 GB" },
            cpuCores: { type: "number", example: 8 },
            cpuModel: { type: "string", example: "Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz" },
            networkInterfaces: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string", example: "192.168.1.10" },
              },
            },
            currentUser: { type: "string", example: "ubuntu" },
            processId: { type: "number", example: 12345 },
            workingDirectory: { type: "string", example: "/home/ubuntu/app" },
            environment: { type: "string", example: "development" },
          },
        },
      },
    },
  },
};

export const siteSettingsSwaggerSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: {
      type: "object",
      properties: {
        settings: {
          type: "object",
          properties: {
            site_settings: {
              type: "object",
              properties: {
                site_name: { type: "string", example: BRAND_NAME },
                site_tagline: { type: "string", example: "Best way to trade your cash!" },
                timezone: { type: "string", example: "Asia/Kolkata" },
                currency: { type: "string", example: "INR" },
                currency_symbol: { type: "string", example: "₹" },
                default_language: { type: "string", example: "en" },
              },
            },
            support_info: {
              type: "object",
              properties: {
                support_email: { type: "string", example: SUPPORT_EMAIL },
                support_mobile: { type: "string", example: "+91-1234567891" },
                whatsapp_number: { type: "string", example: "+91-1234567891" },
                address: { type: "string", example: "Address - 123456" },
                cin: { type: "string", example: "123456ER5484889" },
                registered_office: { type: "string", example: "Example - 123456" },
              },
            },
            seo_settings: {
              type: "object",
              properties: {
                meta_title: { type: "string", example: `${BRAND_NAME}- Sell & Earn Fast` },
                meta_description: { type: "string", example: "description" },
                meta_keywords: { type: "string", example: "keyword1, keyword2" },
              },
            },
            policies: {
              type: "object",
              properties: {
                terms_and_conditions: { type: "string", example: "By using..." },
                privacy_policy: { type: "string", example: "We respect your privacy..." },
                return_policy: { type: "string", example: "Returns accepted within 7 days..." },
                shipping_policy: { type: "string", example: "Free shipping on all orders..." },
              },
            },
            notifications: {
              type: "object",
              properties: {
                email_notifications_enabled: { type: "boolean", example: true },
              },
            },
          },
        },
      },
    },
  },
};