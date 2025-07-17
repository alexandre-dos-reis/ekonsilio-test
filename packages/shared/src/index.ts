import type { StatusConv } from "@ek/db/types";

export const authBasePath = "/auth" as const;

export type SocketMessage =
  | {
      event: "message";
      data: {
        content: string;
        createdAt: string;
        user: {
          id: string;
          role: string;
          name: string;
        };
      };
    }
  | {
      event: "join-conversation";
      data: { userName: string; conversationStatus?: StatusConv };
    }
  | {
      event: "quit-conversation";
      data: { userName: string; conversationStatus?: StatusConv };
    }
  | {
      event: "conversations-waiting-for-genius";
      data: {
        convs: Array<{
          id: string;
          userName: string;
          createdAt: string;
          content: string;
        }>;
      };
    }
  | {
      event: "users-currently-present-in-the-conversation";
      data: { usersId: Array<string> };
    };

export const getData = (rawData: any) => {
  return JSON.parse(rawData) as SocketMessage;
};

export const sendData = (data: SocketMessage) => {
  return JSON.stringify(data);
};
