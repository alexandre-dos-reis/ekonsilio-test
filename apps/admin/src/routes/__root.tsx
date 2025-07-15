import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";

import { ToastContainer } from "react-toastify";
import { type UserContextType } from "@/contexts/user";

interface RouterContext {
  auth: UserContextType;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div className="h-screen overflow-y-hidden">
      <Navbar />
      <div className="max-w-xl mx-auto py-5 h-full relative">
        <Outlet />
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  ),
});
