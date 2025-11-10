import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
extendZodWithOpenApi(z);
export const addToCartSchema = z.object({
    productId: z
        .string({
            required_error: "Product ID is required",
        })
        .min(1, "Product ID cannot be empty")
        .openapi({ example: "6612f8b3c4e1b6c80dc4c9d1" }),

    quantity: z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than 0")
        .default(1)
        .openapi({ example: 1 }),
    type: z.enum(['I', 'D', 'A'])
        .openapi({ example: 'I' }),

});

