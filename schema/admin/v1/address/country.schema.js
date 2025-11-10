import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createCountrySchema = z.object({
  name: z.string().min(2).max(100).openapi({ example: "India" }),
  code: z.string().min(2).max(10).openapi({ example: "IN" }),
  status: z.coerce.boolean().optional().openapi({ example: true }),
});
