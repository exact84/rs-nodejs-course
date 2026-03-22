import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  inStock: z.boolean(),
});

export const UpdateProductSchema = CreateProductSchema;

export const ProductResponseSchema = CreateProductSchema.extend({
  id: z.string().uuid(),
});

export const ProductsResponseSchema = ProductResponseSchema.array();

export const ProductIdParamsSchema = z.object({
  productId: z.string().uuid(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductIdParams = z.infer<typeof ProductIdParamsSchema>;
