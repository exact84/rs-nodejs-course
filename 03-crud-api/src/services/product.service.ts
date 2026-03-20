import { randomUUID } from "node:crypto";
import {
  type CreateProductInput,
  ProductResponseSchema,
  type UpdateProductInput,
  type ProductResponse,
} from "../schemas/product.schema.ts";

const products: ProductResponse[] = [];

export function createProduct(data: CreateProductInput): ProductResponse {
  const newProduct: ProductResponse = {
    ...data,
    id: randomUUID(),
  };

  products.push(newProduct);
  return newProduct;
}

export function getProducts(): ProductResponse[] {
  return products;
}

export function getProductById(id: string): ProductResponse | null {
  return products.find((p) => p.id === id) || null;
}

export function deleteProductById(id: string): boolean {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

export function updateProductById(
  id: string,
  data: UpdateProductInput,
): ProductResponse | null {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated = products[index];
  const validated = ProductResponseSchema.parse({
    ...updated,
    ...data,
    id: updated.id,
  });
  products[index] = validated;
  return validated;
}
