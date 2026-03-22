import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app";
import { resetProducts } from "../src/services/product.service";
import { randomUUID } from "node:crypto";

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
};

type ProductResponse = ProductPayload & {
  id: string;
};

const validProduct: ProductPayload = {
  name: "Keyboard",
  description: "Mechanical keyboard",
  price: 120,
  category: "Electronics",
  inStock: true,
};

test("Scenario 1: full CRUD flow", async () => {
  resetProducts();
  const app = await buildApp();

  const getAllBeforeCreateResponse = await app.inject({
    method: "GET",
    url: "/api/products",
  });

  assert.equal(getAllBeforeCreateResponse.statusCode, 200);
  assert.deepEqual(getAllBeforeCreateResponse.json() as ProductResponse[], []);

  const createResponse = await app.inject({
    method: "POST",
    url: "/api/products",
    payload: validProduct,
  });

  assert.equal(createResponse.statusCode, 201);

  const createdProduct = createResponse.json() as ProductResponse;

  assert.equal(typeof createdProduct.id, "string");
  assert.equal(createdProduct.name, validProduct.name);
  assert.equal(createdProduct.description, validProduct.description);
  assert.equal(createdProduct.price, validProduct.price);
  assert.equal(createdProduct.category, validProduct.category);
  assert.equal(createdProduct.inStock, validProduct.inStock);

  const getByIdResponse = await app.inject({
    method: "GET",
    url: `/api/products/${createdProduct.id}`,
  });

  assert.equal(getByIdResponse.statusCode, 200);
  assert.deepEqual(getByIdResponse.json() as ProductResponse, createdProduct);

  const updatedPayload: ProductPayload = {
    name: "Mouse",
    description: "Wireless mouse",
    price: 80,
    category: "Accessories",
    inStock: false,
  };

  const updateResponse = await app.inject({
    method: "PUT",
    url: `/api/products/${createdProduct.id}`,
    payload: updatedPayload,
  });

  assert.equal(updateResponse.statusCode, 200);

  const updatedProduct = updateResponse.json() as ProductResponse;

  assert.equal(updatedProduct.id, createdProduct.id);
  assert.equal(updatedProduct.name, updatedPayload.name);
  assert.equal(updatedProduct.description, updatedPayload.description);
  assert.equal(updatedProduct.price, updatedPayload.price);
  assert.equal(updatedProduct.category, updatedPayload.category);
  assert.equal(updatedProduct.inStock, updatedPayload.inStock);

  const deleteResponse = await app.inject({
    method: "DELETE",
    url: `/api/products/${createdProduct.id}`,
  });

  assert.ok(deleteResponse.statusCode === 204);

  const getDeletedResponse = await app.inject({
    method: "GET",
    url: `/api/products/${createdProduct.id}`,
  });

  assert.equal(getDeletedResponse.statusCode, 404);

  await app.close();
});

test("Scenario 2: operations with non-existing product should return 404", async () => {
  resetProducts();
  const app = await buildApp();

  const nonExistingId = randomUUID();

  const getResponse = await app.inject({
    method: "GET",
    url: `/api/products/${nonExistingId}`,
  });

  assert.equal(getResponse.statusCode, 404);

  const updateResponse = await app.inject({
    method: "PUT",
    url: `/api/products/${nonExistingId}`,
    payload: {
      name: "Updated",
      description: "Updated description",
      price: 100,
      category: "Updated category",
      inStock: true,
    },
  });

  assert.equal(updateResponse.statusCode, 404);

  const deleteResponse = await app.inject({
    method: "DELETE",
    url: `/api/products/${nonExistingId}`,
  });

  assert.equal(deleteResponse.statusCode, 404);

  await app.close();
});

test("Scenario 3: invalid payload should return 400", async () => {
  resetProducts();
  const app = await buildApp();

  const invalidCreateResponse = await app.inject({
    method: "POST",
    url: "/api/products",
    payload: {
      name: "Broken product",
      price: "cheap",
      inStock: "yes",
    },
  });

  assert.equal(invalidCreateResponse.statusCode, 400);

  const createValidResponse = await app.inject({
    method: "POST",
    url: "/api/products",
    payload: validProduct,
  });

  assert.equal(createValidResponse.statusCode, 201);

  const createdProduct = createValidResponse.json() as ProductResponse;

  const invalidUpdateResponse = await app.inject({
    method: "PUT",
    url: `/api/products/${createdProduct.id}`,
    payload: {
      name: 123,
      description: true,
      price: "wrong",
      category: null,
      inStock: "false",
    },
  });

  assert.equal(invalidUpdateResponse.statusCode, 400);

  await app.close();
});
