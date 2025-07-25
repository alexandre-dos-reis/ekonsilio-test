import { RouterProvider } from "@tanstack/react-router";
import { UserContextProvider, useUserContext } from "./contexts/user";
import { router } from "./router";

const InnerApp = () => {
  const { setUser, user, isLoading } = useUserContext();
  return (
    <RouterProvider
      router={router}
      context={{ auth: { user, setUser, isLoading } }}
    />
  );
};

export const App = () => (
  <UserContextProvider>
    <InnerApp />
  </UserContextProvider>
);
