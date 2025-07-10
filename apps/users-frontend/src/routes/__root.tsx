import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";

import { ToastContainer } from "react-toastify";
import { UserContextProvider } from "@/contexts/user";

export const Route = createRootRoute({
  component: () => (
    <UserContextProvider>
      <Navbar />
      <div className="max-w-xl mx-auto">
        <Outlet />
      </div>
      <ToastContainer position="bottom-center" />
    </UserContextProvider>
  ),
});
