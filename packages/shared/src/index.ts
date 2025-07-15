import type { UserRole, StatusConv } from "@ek/db/types";

export type SocketMessage =
  | {
      event: "message";
      data: {
        content: string;
        createdAt: string;
        user: {
          id: string;
          role: UserRole;
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
    };

export const getData = (rawData: any) => {
  return JSON.parse(rawData) as SocketMessage;
};

export const sendData = (data: SocketMessage) => {
  return JSON.stringify(data);
};
