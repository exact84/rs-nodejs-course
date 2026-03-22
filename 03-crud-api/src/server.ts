import "dotenv/config";
import { buildApp } from "./app";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "localhost";

const app = await buildApp();

app.addHook("onRequest", (request, _reply, done) => {
  if (process.env.WORKER_PORT) {
    console.log(
      `Worker ${process.env.WORKER_PORT} got ${request.method} ${request.url}`,
    );
  }
  done();
});

console.log("Server is listening...");

await app.listen({ host, port });

process.on("SIGINT", async () => {
  await app.close();
  process.exit(0);
});
