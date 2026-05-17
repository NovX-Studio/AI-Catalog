import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  brand: z.string().min(1, "Brand is required").max(100),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000),
  specs: z.string().optional().default("{}"),
  price: z.number().positive("Price must be greater than 0"),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  available: z.boolean().optional().default(true),
  categoryId: z.string().min(1, "Category is required"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
