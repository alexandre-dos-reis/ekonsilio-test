import type { App } from "@/types";
import { Hono } from "hono";

export const geniusRoutes = new Hono<App>()
  .basePath("/genius")
  .get("/", (c) => c.json("hello from genius route !"));

export type GeniusRoutes = typeof geniusRoutes;
