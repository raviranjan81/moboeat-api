import { z } from "zod";

export const mainCategorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  status: z.string().optional(),
});
