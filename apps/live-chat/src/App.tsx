import { RouterProvider } from "@tanstack/react-router";
import { UserContextProvider, useUserContext } from "./contexts/user";
import { router } from "./router";
import { env } from "./utils/env";

const InnerApp = () => {
  const { setUser, user } = useUserContext();
  return (
    <RouterProvider router={router} context={{ auth: { user, setUser } }} />
  );
};

export const App = () => (
  <UserContextProvider>
    <InnerApp />
  </UserContextProvider>
);
