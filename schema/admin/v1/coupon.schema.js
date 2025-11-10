import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);
export const createCouponSchema = z.object({
    code: z.string().min(3).max(20).openapi({ example: "SUMMER25" }),
    discountType: z.enum(["percentage", "fixed"]).openapi({ example: "percentage" }),
    discountValue: z.number().min(1).openapi({ example: 25 }),
    usageLimit: z.number().optional().openapi({ example: 100 }),
    validFrom: z.coerce.date().openapi({ example: "2025-05-01T00:00:00.000Z" }),
    validUntil: z.coerce.date().openapi({ example: "2025-06-01T23:59:59.000Z" }),
    isActive: z.coerce.boolean().openapi({ example: true }),
});

export const updateCouponSchema = createCouponSchema.partial();

export const getCouponParamsSchema = z.object({
    id: z.string().openapi({ example: "661fa93aaab1d2e332c0b50f" }),
});
