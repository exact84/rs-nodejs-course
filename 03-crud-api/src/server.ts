import { buildApp } from "./app.ts";
import productsRoute from "./routes/products.route.ts";

const app = buildApp();

await app.register(productsRoute);

console.log("Server is listening...");

await app.listen({ port: 3000 });

process.on("SIGINT", async () => {
  await app.close();
  process.exit(0);
});
