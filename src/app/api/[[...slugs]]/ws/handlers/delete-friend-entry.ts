import type { WebSocketRoute } from "@/app/api";
import { sendPendingInvitesLetter } from "../letters/pending-invites";
import { DeleteFriendEntryDataCompiler } from "../shared-schema";
import { prismaClient } from "@/app/libs/db";
import type { FriendStatus } from "@prisma/client";

const deleteFriendEntryHandler: WebSocketRoute = {
  message: "void:delete-friend-entry",
  execute: async ({ data, user }) => {
    if (!DeleteFriendEntryDataCompiler.Check(data)) {
      return;
    }

    const { pair } = data;

    if (user.id !== pair.requester.id && user.id !== pair.addressee.id) {
      return;
    }

    const allowedStatuses: FriendStatus[] = ["ACCEPTED", "PENDING"];

    if (user.id === pair.requester.id) {
      // If the user (requester) is the one that blocked the other user (addressee),
      // then they can unblock the user. The addressee shouldn't be able to unblock themselves.
      allowedStatuses.push("BLOCKED");
    }

    await prismaClient.friend.delete({
      where: {
        requesterId_addresseeId: {
          requesterId: pair.requester.id,
          addresseeId: pair.addressee.id,
        },
        status: {
          in: allowedStatuses,
        },
      },
    });

    sendPendingInvitesLetter(pair.requester.id);
    sendPendingInvitesLetter(pair.addressee.id);
  },
};

export { deleteFriendEntryHandler };
