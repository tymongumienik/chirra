import type { WebSocketRoute } from "@/app/api";
import { sendPendingInvitesLetter } from "../letters/pending-invites";
import { sendFriendsListLetter } from "../letters/friends-list";

const pingHandler: WebSocketRoute = {
  message: "over:ping",
  execute: async ({ reply, user }) => {
    sendFriendsListLetter(user.id);
    sendPendingInvitesLetter(user.id);
    reply("pong");
  },
};

export { pingHandler };
