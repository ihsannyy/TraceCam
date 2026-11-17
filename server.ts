import { createApp } from "./src/app.ts";

const app = createApp();

if (import.meta.main) {
  const port = Number(Deno.env.get("PORT") ?? 8080);
  Deno.serve({ port }, app.fetch);
  console.log(`🚀 TraceCam running at http://localhost:${port}`);
}
