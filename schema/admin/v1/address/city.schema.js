import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);
export const createCitySchema = z.object({
  name: z.string().min(2).max(100).openapi({ example: "Pune" }),
  stateId: z.string().min(24).max(24).openapi({
    example: "650fbc12e3df74001fe1d2a7",
    description: "MongoDB ObjectId of the state",
  }),
  countryId: z.string().min(24).max(24).openapi({
    example: "650fbb6ad4ae3f001fdc0d1e",
    description: "MongoDB ObjectId of the country",
  }),
  status: z.coerce.boolean().optional().openapi({ example: true }),
});
