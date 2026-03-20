import "dotenv/config";
import { buildApp } from "./app";
import productsRoute from "./routes/products.route";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "localhost";

const app = buildApp();

await app.register(productsRoute);

console.log("Server is listening...");

await app.listen({ port, host });

process.on("SIGINT", async () => {
  await app.close();
  process.exit(0);
});
