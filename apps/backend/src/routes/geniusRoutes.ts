import { geniusAuth } from "@/auth";
import type { App } from "@/types";
import { Hono } from "hono";

export const geniusRoutes = new Hono<App>()
  .basePath("/genius")
  .use(async (c, next) => {
    const geniusSession = await geniusAuth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!geniusSession) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    c.set("customer", geniusSession.user);

    return next();
  })
  .get("/", (c) => c.json("hello from genius route !"));

export type GeniusRoutes = typeof geniusRoutes;
