import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import session from "./routes/session"
import { db } from "@meow/database";
import chat from "./routes/chat"

const app = new Hono();
app.get("/", (c) => c.text("hello world"));

setInterval(() => {
  db.$queryRaw`SELECT 1`.catch(() => {});
}, 120_000);

// standarize error
app.onError((e, c) => {
  console.error("Unhandled error:", e instanceof Error ? e.message : e);
  if (e instanceof HTTPException) {
    return c.json(
      {
        error: e.message || "Request failed",
      },
      e.status,
    );
  }
  return c.json({ error: "Internal server error" }, 500);
});
const routes=app.route("/sessions",session).route("/chat",chat)

export type AppType=typeof routes;

// high idle time out otherwise tools calls might not complete
export default { port: 3000, fetch: app.fetch, idleTimeout: 255 }
