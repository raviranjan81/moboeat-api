import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const createVendorSchema = z.object({
    name: z.string().min(2).max(100).openapi({ example: "John Traders" }),
    countryId: z.string().openapi({ example: "661fa93aaab1d2e332c0b50f" }),
    cityId: z.string().openapi({ example: "661fa93aaab1d2e332c0b50f" }),
    stateId: z.string().openapi({ example: "661fa93aaab1d2e332c0b50e" }),
    corporateName: z.string().min(2).max(100).openapi({ example: "John Corp Pvt. Ltd." }),
corporateCode: z
  .string()
  .max(50)
  .openapi({ example: "JOHN2025" })
  .optional(),

    mobile: z.string().regex(/^[0-9]{10}$/).openapi({ example: "9876543210" }),
    email: z.string().email().openapi({ example: "vendor@example.com" }),
    contactPerson: z.string().min(2).max(100).openapi({ example: "John Doe" }),
    vendorType: z.string().optional().openapi({ example: "Retailer" }),
    password: z.string().min(6).max(100).openapi({ example: "securePass123" }),
    userId: z.string().min(3).max(50).openapi({ example: "vendor123" }),
});

export const updateVendorSchema = z.object({
    name: z.string().min(2).max(100).openapi({ example: "John Traders" }),
    countryId: z.string().openapi({ example: "661fa93aaab1d2e332c0b50f" }),
    stateId: z.string().openapi({ example: "661fa93aaab1d2e332c0b50e" }),
    cityId: z.string().openapi({ example: "661fa93aaab1d2e332c0b50f" }),
    corporateName: z.string().min(2).max(100).openapi({ example: "John Corp Pvt. Ltd." }),
    corporateCode: z.string().min(2).max(50).openapi({ example: "JOHN2025" }),
    mobile: z.string().regex(/^[0-9]{10}$/).openapi({ example: "9876543210" }),
    email: z.string().email().openapi({ example: "vendor@example.com" }),
    contactPerson: z.string().min(2).max(100).openapi({ example: "John Doe" }),
    vendorType: z.string().optional().openapi({ example: "Retailer" }),
    password: z.optional().openapi({ example: "securePass123" }),
    userId: z.string().min(3).max(50).openapi({ example: "vendor123" }),
});

