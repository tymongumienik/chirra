import type { WebSocketRoute } from "@/app/api";

const pingHandler: WebSocketRoute = {
  message: "ping",
  execute: ({ reply }) => {
    reply("pong");
  },
};

export { pingHandler };
