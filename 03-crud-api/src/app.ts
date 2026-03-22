import Fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import productsRoute from "./routes/products.route";

export async function buildApp() {
  const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.addHook("onRequest", (request, _reply, done) => {
    if (process.env.WORKER_PORT) {
      console.log(
        `Worker ${process.env.WORKER_PORT} got ${request.method} ${request.url}`,
      );
    }
    done();
  });

  fastify.setNotFoundHandler((request, reply) => {
    return reply
      .status(404)
      .send({ message: `Route ${request.url} not found` });
  });

  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    let statusCode = 500;
    let message = "Internal Server Error";

    if (typeof error === "object" && error !== null) {
      if ("statusCode" in error && typeof error.statusCode === "number") {
        statusCode = error.statusCode;
      }

      if ("message" in error && typeof error.message === "string") {
        message = error.message;
      }
    }

    if (statusCode === 500) {
      message = "Internal Server Error";
    }

    return reply.status(statusCode).send({ message });
  });

  await fastify.register(productsRoute);

  return fastify;
}
