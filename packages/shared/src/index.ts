import type { StatusConv } from "@ek/db/types";
import type { Hono } from "hono";
import { hc } from "hono/client";

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

export const createClient = <THono extends Hono<any, any, any>>(
  backendUrl: string,
) =>
  hc<THono>(backendUrl, {
    fetch: ((input, init) => {
      return fetch(input, {
        ...init,
        credentials: "include", // Required for sending cookies cross-origin
      });
    }) as typeof fetch,
  });
