import { updateLastSeen, type WebSocketRoute } from "@/app/api";
import { sendPendingInvitesLetter } from "../letters/pending-invites";
import { sendFriendsListLetter } from "../letters/friends-list";
import { sendAnnounceStatusesLetter } from "../letters/announce-statuses";
import { sendSideMessagesLetter } from "../letters/side-messages";
import { sendDMBriefingLetter } from "../letters/messages-briefing";

const pingHandler: WebSocketRoute = {
  message: "over:ping",
  execute: async ({ reply, user }) => {
    updateLastSeen(user.id);
    const friends = await sendFriendsListLetter(user.id);
    await sendPendingInvitesLetter(user.id);
    await sendAnnounceStatusesLetter(friends, [user.id]);
    const sideMessageUsers = await sendSideMessagesLetter(user.id);
    await sendDMBriefingLetter(user.id, sideMessageUsers);
    reply("pong");
  },
};

export { pingHandler };
