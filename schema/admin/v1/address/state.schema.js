import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);
export const createStateSchema = z.object({
  name: z.string().min(2).max(100).openapi({ example: "Maharashtra" }),
  code: z.string().min(2).max(10).openapi({ example: "MH" }),
  countryId: z.string().min(24).max(24).openapi({
    example: "650fbb6ad4ae3f001fdc0d1e",
    description: "MongoDB ObjectId of the country",
  }),
  status: z.coerce.boolean().optional().openapi({ example: true }),
});
