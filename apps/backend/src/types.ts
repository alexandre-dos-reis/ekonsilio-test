import { customerAuth, geniusAuth } from "./auth";

export type App = {
  Variables: {
    customer: (typeof customerAuth)["$Infer"]["Session"]["user"] | null;
    genius: (typeof geniusAuth)["$Infer"]["Session"]["user"] | null;
  };
};
