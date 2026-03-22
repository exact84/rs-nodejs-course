import cluster from "node:cluster";
import http, {
  type IncomingHttpHeaders,
  type IncomingMessage,
  type RequestOptions,
  type ServerResponse,
} from "node:http";
import { availableParallelism } from "node:os";
import { randomUUID } from "node:crypto";

import type {
  CreateMessage,
  CreateResponseMessage,
  DbRequestMessage,
  DbResponseMessage,
  DeleteResponseMessage,
  GetAllResponseMessage,
  GetByIdResponseMessage,
  UpdateResponseMessage,
} from "./types/ipc";
import type {
  ProductResponse,
  UpdateProductInput,
} from "./schemas/product.schema";
import { ProductResponseSchema } from "./schemas/product.schema";

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "localhost";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDbRequestMessage(message: unknown): message is DbRequestMessage {
  if (!isRecord(message)) {
    return false;
  }

  if (typeof message["requestId"] !== "string") {
    return false;
  }

  if (typeof message["action"] !== "string") {
    return false;
  }

  return true;
}

function proxyRequest(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  workerPort: number,
): void {
  const headers: IncomingHttpHeaders = { ...req.headers };

  const options: RequestOptions = {
    hostname: HOST,
    port: workerPort,
    path: req.url,
    method: req.method,
    headers,
  };

  const proxy = http.request(options, (proxyRes) => {
    const statusCode = proxyRes.statusCode ?? 500;
    res.writeHead(statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "application/json" });
    }

    res.end(JSON.stringify({ message: "Bad gateway" }));
  });

  req.pipe(proxy);
}

function sendResponse(
  worker: cluster.Worker,
  response: DbResponseMessage,
): void {
  worker.send(response);
}

if (cluster.isPrimary) {
  const workersCount = Math.max(availableParallelism() - 1, 1);
  const workerPorts: number[] = [];
  const products = new Map<string, ProductResponse>();
  let currentWorkerIndex = 0;

  for (let i = 0; i < workersCount; i += 1) {
    const workerPort = PORT + i + 1;
    workerPorts.push(workerPort);

    cluster.fork({
      ...process.env,
      MULTI: "true",
      WORKER_PORT: String(workerPort),
      PORT: String(PORT),
      HOST,
    });
  }

  cluster.on("message", (worker, message: unknown) => {
    if (!isDbRequestMessage(message)) {
      return;
    }

    switch (message.action) {
      case "getAll": {
        const response: GetAllResponseMessage = {
          requestId: message.requestId,
          status: 200,
          result: Array.from(products.values()),
        };

        sendResponse(worker, response);
        return;
      }

      case "getById": {
        const product = products.get(message.payload.id);

        const response: GetByIdResponseMessage =
          product ?
            {
              requestId: message.requestId,
              status: 200,
              result: product,
            }
          : {
              requestId: message.requestId,
              status: 404,
              result: { message: "Product not found" },
            };

        sendResponse(worker, response);
        return;
      }

      case "create": {
        const createPayload: CreateMessage["payload"] = message.payload;

        const created = ProductResponseSchema.parse({
          ...createPayload,
          id: randomUUID(),
        });

        products.set(created.id, created);

        const response: CreateResponseMessage = {
          requestId: message.requestId,
          status: 201,
          result: created,
        };

        sendResponse(worker, response);
        return;
      }

      case "update": {
        const current = products.get(message.payload.id);

        if (!current) {
          const response: UpdateResponseMessage = {
            requestId: message.requestId,
            status: 404,
            result: { message: "Product not found" },
          };

          sendResponse(worker, response);
          return;
        }

        const data: UpdateProductInput = message.payload.data;

        const updated = ProductResponseSchema.parse({
          ...current,
          ...data,
          id: current.id,
        });

        products.set(updated.id, updated);

        const response: UpdateResponseMessage = {
          requestId: message.requestId,
          status: 200,
          result: updated,
        };

        sendResponse(worker, response);
        return;
      }

      case "delete": {
        const existed = products.has(message.payload.id);

        if (!existed) {
          const response: DeleteResponseMessage = {
            requestId: message.requestId,
            status: 404,
            result: { message: "Product not found" },
          };

          sendResponse(worker, response);
          return;
        }

        products.delete(message.payload.id);

        const response: DeleteResponseMessage = {
          requestId: message.requestId,
          status: 204,
          result: null,
        };

        sendResponse(worker, response);
        return;
      }
    }
  });

  const balancer = http.createServer((req, res) => {
    const workerPort = workerPorts[currentWorkerIndex];

    currentWorkerIndex += 1;
    if (currentWorkerIndex >= workerPorts.length) {
      currentWorkerIndex = 0;
    }

    proxyRequest(req, res, workerPort);
  });

  balancer.listen(PORT, HOST, () => {
    console.log(`Load balancer running on http://${HOST}:${PORT}`);
  });
} else {
  const workerPort = Number(process.env.WORKER_PORT);

  const { buildApp } = await import("./app");

  const app = await buildApp();

  await app.listen({
    port: workerPort,
    host: HOST,
  });

  console.log(`Worker running on ${workerPort}`);
}
