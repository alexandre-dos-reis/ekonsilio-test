import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Set up a Router instance
export const router = createRouter({
  defaultStaleTime: 0,
  defaultPreloadStaleTime: 0,
  routeTree,
  defaultPreload: false,
  scrollRestoration: true,
  context: {
    auth: { user: null, setUser: () => null, isLoading: true },
  },
});
