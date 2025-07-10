import type { Auth } from "../../../backend/src/exports/client-types";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

type User = Auth["$Infer"]["Session"]["user"] | null;

export type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => null,
});

const getInitialState = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User>(getInitialState);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  return (
    <UserContext
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </UserContext>
  );
};

export const useUserContext = () => useContext(UserContext);
