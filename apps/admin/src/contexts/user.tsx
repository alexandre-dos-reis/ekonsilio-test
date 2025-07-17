import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "@ek/auth";
import { authClient } from "@/utils/clients";

export type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => null,
  isLoading: true,
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { data, isPending } = authClient.useSession();
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (data?.user) {
      setUser(data.user as User);
    }
  }, [data?.user]);

  if (isPending) {
    return null;
  }

  return (
    <UserContext
      value={{
        user,
        setUser,
        isLoading: isPending,
      }}
    >
      {children}
    </UserContext>
  );
};

export const useUserContext = () => useContext(UserContext);
