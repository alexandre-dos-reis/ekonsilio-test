import type { Auth } from "../../../backend/src/exports/client-types";
import {
  createContext,
  useContext,
  useState,
  type SetStateAction,
  type Dispatch,
  type PropsWithChildren,
} from "react";

type User = Auth["$Infer"]["Session"]["user"] | null;

const UserContext = createContext<{
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}>({
  user: null,
  setUser: () => null,
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [localUser, setLocalUser] = useState<User>(null);

  return (
    <UserContext value={{ user: localUser, setUser: setLocalUser }}>
      {children}
    </UserContext>
  );
};

export const useUserContext = () => useContext(UserContext);
