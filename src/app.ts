import { Hono } from "hono";
import { logger } from "./middleware/logger.js";
import { api } from "./routes/api.js";

export function createApi() {
  const app = new Hono();

  app.use("*", logger);

  app.use("*", async (c, next) => {
    c.header("Permissions-Policy", "camera=(self)");
    await next();
  });

  app.route("/api", api);
  app.all("/api/*", (c) => c.json({ error: "Endpoint tidak ditemukan" }, 404));

  return app;
}

const app = createApi();

export default app;
