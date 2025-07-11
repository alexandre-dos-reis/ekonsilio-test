import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { authClient } from "@/utils/auth";
import type { User } from "@/utils/types";

export type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => null,
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { data, isPending } = authClient.useSession();
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (isPending === false && data?.user) {
      setUser(data.user);
    }
  }, [isPending, data?.user]);

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
