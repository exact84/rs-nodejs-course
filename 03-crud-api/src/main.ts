import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

async function start() {
  await fastify.listen({ port: 3000 });
}

start();
