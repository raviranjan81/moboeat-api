
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const getMethodCommonSchema = z.object({
    page: z.number().optional().openapi({ example: 1 }),
    limit: z.number().optional().openapi({ example: 10 }),
    paginate: z.boolean().optional().openapi({ example: true }),
    filters: z.record(z.any()).optional().openapi({ example: {} }),
    sortField: z.string().optional().openapi({ example: "createdAt" }),
    sortOrder: z.string().optional().openapi({ example: "desc" }),
});