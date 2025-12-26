import type { WebSocketRoute } from "@/app/api";
import { sendPendingInvitesLetter } from "../letters/pending-invites";

const pingHandler: WebSocketRoute = {
  message: "over:ping",
  execute: async ({ reply, user }) => {
    sendPendingInvitesLetter(user.id);
    reply("pong");
  },
};

export { pingHandler };
