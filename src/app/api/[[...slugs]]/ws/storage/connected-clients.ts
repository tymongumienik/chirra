export const connectedClients = new Map<
  string,
  Map<string, import("ws").WebSocket>
>();
