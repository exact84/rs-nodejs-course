import { randomUUID } from "node:crypto";
import {
  type CreateProductInput,
  ProductResponseSchema,
  type UpdateProductInput,
  type ProductResponse,
} from "../schemas/product.schema";
import {
  sendCreate,
  sendDelete,
  sendGetAll,
  sendGetById,
  sendUpdate,
} from "./ipc.client";

const isMulti = process.env.MULTI === "true";

const products: ProductResponse[] = [];

export function resetProducts(): void {
  products.length = 0;
}

export async function createProduct(
  data: CreateProductInput,
): Promise<ProductResponse> {
  if (isMulti) {
    const response = await sendCreate(data);
    return response.result;
  }

  const newProduct: ProductResponse = {
    ...data,
    id: randomUUID(),
  };

  products.push(newProduct);
  return newProduct;
}

export async function getProducts(): Promise<ProductResponse[]> {
  if (isMulti) {
    const response = await sendGetAll();
    return response.result;
  }

  return products;
}

export async function getProductById(
  id: string,
): Promise<ProductResponse | null> {
  if (isMulti) {
    const response = await sendGetById(id);

    if (response.status !== 200) {
      return null;
    }

    return response.result;
  }
  return products.find((p) => p.id === id) || null;
}

export async function deleteProductById(id: string): Promise<boolean> {
  if (isMulti) {
    const response = await sendDelete(id);
    return response.status === 204;
  }
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

export async function updateProductById(
  id: string,
  data: UpdateProductInput,
): Promise<ProductResponse | null> {
  if (isMulti) {
    const response = await sendUpdate(id, data);

    if (response.status !== 200) {
      return null;
    }

    return response.result;
  }

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
