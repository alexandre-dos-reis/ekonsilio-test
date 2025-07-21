import type { App } from "..";
import { auth } from "../auth";
import { createMiddleware } from "hono/factory";

export const roleMiddleware = (role: "customer" | "genius") => {
  return createMiddleware<App>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(null, 403);
    }

    if (user.role !== role) {
      await auth.api.signOut({ headers: c.req.raw.headers });
      return c.json(null, 403);
    }

    return next();
  });
};
