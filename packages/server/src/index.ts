import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import session from "./routes/session"

const app = new Hono();
app.get("/", (c) => c.text("hello world"));

// standarize error
app.onError((e, c) => {
  if (e instanceof HTTPException) {
    return c.json(
      {
        error: e.message || "Request failed",
      },
      e.status,
    );
  }
  // console.error("Unhandled error", e);
  return c.json({ error: "Internal server error" }, 500);
});
const routes=app.route("/sessions",session);

export type AppType=typeof routes;

// high idle time out otherwise tools calls might not complete
export default { port: 3000, fetch: app.fetch, idleTimeout: 255 }
