import { updateLastSeen, type WebSocketRoute } from "@/app/api";
import { sendPendingInvitesLetter } from "../letters/pending-invites";
import { sendFriendsListLetter } from "../letters/friends-list";
import { announceStatusesLetter } from "../letters/announce-statuses";

const pingHandler: WebSocketRoute = {
  message: "over:ping",
  execute: async ({ reply, user }) => {
    updateLastSeen(user.id);
    const friends = await sendFriendsListLetter(user.id);
    await sendPendingInvitesLetter(user.id);
    await announceStatusesLetter(friends, [user.id]);
    reply("pong");
  },
};

export { pingHandler };
