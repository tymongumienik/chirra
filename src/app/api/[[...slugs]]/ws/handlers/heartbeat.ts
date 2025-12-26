import { updateLastSeen, type WebSocketRoute } from "@/app/api";

const heartbeatHandler: WebSocketRoute = {
  message: "void:heartbeat",
  execute: async ({ user }) => {
    updateLastSeen(user.id);
  },
};

export { heartbeatHandler };
