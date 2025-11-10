import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const commonErrorResponseSchema = z
    .object({
        response: z.literal(false),
        message: z.string(),
        data: z.unknown().optional(),
    })
    .openapi({
        title: "CommonErrorResponse",
        description: "Common error response schema for all errors.",
    });
