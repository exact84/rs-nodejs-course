# CRUD API.
Simple CRUD API for a Product Catalog using an in-memory database underneath. 
Built with Fastify as the framework.

## Features

* CRUD operations for products
* Zod validation
* In-memory database
* Development and production modes
* Horizontal scaling using Node.js Cluster API
* Round-robin load balancing

---

## Installation

```
npm install
```

---

## Environment variables

Create a `.env` file (or use `.env.example`):

```
PORT=4000
HOST=127.0.0.1
```

---

## Run application

### Development mode

```
npm run start:dev
```

Runs the app with hot reload.

---

### Production mode

```
npm run start:prod
```

Builds the project and runs compiled code.

---

### Multi-instance mode (horizontal scaling)

```
npm run start:multi
```

* Starts a load balancer on `PORT`
* Starts multiple workers on `PORT + n`
* Distributes requests using round-robin algorithm

Example (PORT=4000, 4 CPUs):

* Load balancer: http://localhost:4000
* Workers:

  * http://localhost:4001
  * http://localhost:4002
  * http://localhost:4003

---

## API

### Get all products

GET /api/products

---

### Get product by id

GET /api/products/:productId

---

### Create product

POST /api/products
Content-Type: application/json

Body:

```
{
  "name": "Product",
  "description": "Description",
  "price": 100,
  "category": "Category",
  "inStock": true
}
```

---

### Update product

PUT /api/products/:productId

---

### Delete product

DELETE /api/products/:productId

---

## Notes

* Data is stored in memory (not persistent)
* In multi-instance mode, all workers share state via primary process
