import type { WebSocketRoute } from "@/app/api";

const pingHandler: WebSocketRoute = {
  message: "ping",
  execute: async ({ reply }) => {
    reply("pong");
  },
};

export { pingHandler };
