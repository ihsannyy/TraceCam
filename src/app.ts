import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { logger } from "./middleware/logger.ts";
import { api } from "./routes/api.ts";

const PUBLIC_DIR = decodeURIComponent(
  new URL("../public/", import.meta.url).pathname,
);

export function createApp() {
  const app = new Hono();

  app.use("*", logger);

  app.use("*", async (c, next) => {
    c.header("Permissions-Policy", "camera=(self)");
    await next();
  });

  app.route("/api", api);
  app.all("/api/*", (c) => c.json({ error: "Endpoint tidak ditemukan" }, 404));

  app.use("/*", serveStatic({ root: PUBLIC_DIR }));

  app.get("/js/*", (c) => c.text("Not found", 404));
  app.get("/css/*", (c) => c.text("Not found", 404));

  app.get("*", serveStatic({ root: PUBLIC_DIR, path: "index.html" }));

  return app;
}
