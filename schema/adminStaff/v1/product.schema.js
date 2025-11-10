import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  image: z.string().url("Invalid image URL").trim(),
  mainCategory: z.string().min(24).max(24, "Invalid mainCategoryId"),
  category: z.string().min(24).max(24, "Invalid categoryId"),
  subCategory: z.string().min(24).max(24, "Invalid subCategoryId").optional(),
  adminId: z.string().min(24).max(24, "Invalid adminId"),
  status: z.boolean().optional(),
});

export const productListSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  paginate: z.boolean().optional(),
  sortField: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  filters: z
    .object({
      mainCategory: z.string().optional(),
      category: z.string().optional(),
      subCategory: z.string().optional(),
      status: z.boolean().optional(),
      priceMin: z.number().optional(),
      priceMax: z.number().optional(),
    })
    .optional(),
});
