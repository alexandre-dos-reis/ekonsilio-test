import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";

import { ToastContainer } from "react-toastify";
import { type UserContextType } from "@/contexts/user";

interface RouterContext {
  auth: UserContextType;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto">
        <Outlet />
      </div>
      <ToastContainer position="bottom-center" />
    </>
  ),
});
