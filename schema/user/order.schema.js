import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
extendZodWithOpenApi(z);
export const applyCouponSchema = z.object({
  couponCode: z
    .string()
    .min(1, "Coupon code is required")
    .max(50, "Coupon code cannot exceed 50 characters")
    .openapi({ example: "SAVE10" }),
  orderAmount: z
    .number()
    .min(0, "Order amount must be greater than or equal to 0")
    .openapi({ example: 100 }),

});
const productSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity should be at least 1"),
});

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  pincode: z.string().min(1, "Pincode is required"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
});

export const orderCreationSchema = z.object({
  referBy: z.string().optional(),
  products: z.array(productSchema).min(1, "At least one product is required"),
  subtotal: z.number().min(0, "Subtotal must be a positive number"),
  shippingCharges: z.number().default(0),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const productUpdateSchema = z.object({
  productId: objectIdSchema,
  imei: z.array(z.string()).optional(),
});

export const updateOrderSchema = z
  .object({
    status: z.string().min(1, "Status is required"),
    remark: z.string().optional(),
    productUpdates: z.array(productUpdateSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "Dispatched") {
      if (!data.productUpdates || data.productUpdates.length === 0) {
        ctx.addIssue({
          path: ["productUpdates"],
          message: "productUpdates are required when status is 'Dispatched'",
          code: z.ZodIssueCode.custom,
        });
      } else {
        data.productUpdates.forEach((update, index) => {
          if (!Array.isArray(update.imei) || update.imei.length === 0) {
            ctx.addIssue({
              path: ["productUpdates", index, "imei"],
              message: "IMEI must be a non-empty array of strings for dispatched products",
              code: z.ZodIssueCode.custom,
            });
          }
        });
      }
    }
  });
  export const confirmProductsSchema = z.object({
  productData: z
    .array(
      z.object({
        id: z.string().min(1, "Product ID is required"),
        isConfirmed: z.boolean(),
      })
    )
    .min(1, "At least one product must be provided"),
});