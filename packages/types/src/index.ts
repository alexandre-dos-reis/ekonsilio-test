export type SocketMessage =
  | {
      event: "message";
      data: {
        content: string;
        timestamp: number;
        user: {
          id: string;
          role: "genius" | "customer";
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
