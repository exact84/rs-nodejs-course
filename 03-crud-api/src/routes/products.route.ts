import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  CreateProductSchema,
  ErrorResponseSchema,
  ProductIdParamsSchema,
  ProductResponseSchema,
  UpdateProductSchema,
} from "../schemas/product.schema";
import {
  createProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProductById,
} from "../services/product.service";
import { z } from "zod";

export const productsRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/api/products",
    {
      schema: {
        response: {
          200: ProductResponseSchema.array(),
        },
      },
    },
    async (request) => {
      return await getProducts();
    },
  );

  fastify.get(
    "/api/products/:productId",
    {
      schema: {
        params: ProductIdParamsSchema,
        response: {
          200: ProductResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const product = await getProductById(request.params.productId);
      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }
      return reply.status(200).send(product);
    },
  );

  fastify.post(
    "/api/products",
    {
      schema: {
        body: CreateProductSchema,
        response: {
          201: ProductResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const newProduct = await createProduct(request.body);
      return reply.status(201).send(newProduct);
    },
  );

  fastify.put(
    "/api/products/:productId",
    {
      schema: {
        body: UpdateProductSchema,
        params: ProductIdParamsSchema,
        response: {
          200: ProductResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const updated = await updateProductById(
        request.params.productId,
        request.body,
      );
      if (!updated) {
        return reply.status(404).send({ message: "Product not found" });
      }
      return reply.status(200).send(updated);
    },
  );

  fastify.delete(
    "/api/products/:productId",
    {
      schema: {
        params: ProductIdParamsSchema,
        response: {
          204: z.void(),
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const updated = await deleteProductById(request.params.productId);
      if (!updated) {
        return reply.status(404).send({ message: "Product not found" });
      }
      return reply.status(204).send();
    },
  );
};

export default productsRoute;
