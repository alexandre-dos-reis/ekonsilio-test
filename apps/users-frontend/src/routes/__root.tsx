import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto">
        <Outlet />
      </div>
    </>
  ),
});
