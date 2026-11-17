import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "./src/app.js";

app.use("/*", serveStatic({ root: "./public" }));

app.get("/js/*", (c) => c.text("Not found", 404));
app.get("/css/*", (c) => c.text("Not found", 404));

app.get("*", serveStatic({ root: "./public", path: "index.html" }));

const port = Number(process.env.PORT ?? 8080);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 TraceCam running at http://localhost:${info.port}`);
});
