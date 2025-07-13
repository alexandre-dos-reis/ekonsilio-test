export type SocketMessage = {
  event: "message";
  data: { content: string; timestamp: number };
};
