import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  mainCategory: z.string().min(24).max(24, "Invalid mainCategoryId"),
  parentCategory: z.string().optional(),
  status: z.string().optional(),
});

export const categoryListSchema = z.object({
  mainCategoryId: z.string().min(24).max(24).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  paginate: z.boolean().optional(),
  sortField: z.string().optional(),
  sortOrder: z.enum(["asc","desc"]).optional()
});
