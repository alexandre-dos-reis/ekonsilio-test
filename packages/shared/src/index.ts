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
      data: { userName: string };
    }
  | {
      event: "quit-conversation";
      data: { userName: string };
    };

export const getData = (rawData: any) => {
  return JSON.parse(rawData) as SocketMessage;
};

export const sendData = (data: SocketMessage) => {
  return JSON.stringify(data);
};
