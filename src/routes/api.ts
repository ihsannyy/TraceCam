import { Hono } from "hono";

export const api = new Hono();

api.get("/health", (c) =>
  c.json({
    ok: true,
    app: "tracecam",
    time: new Date().toISOString(),
  }),
);

api.post("/traces", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Body harus JSON" }, 400);
  return c.json({ ok: true, received: body });
});
