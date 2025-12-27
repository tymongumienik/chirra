import type { WebSocketRoute } from "@/app/api";
import { prismaClient } from "@/app/libs/db";
import { logger } from "@/app/libs/logger";
import { sendFriendsListLetter } from "../letters/friends-list";
import { sendPendingInvitesLetter } from "../letters/pending-invites";
import { AcceptFriendRequestDataCompiler } from "../shared-schema";

const acceptFriendRequestHandler: WebSocketRoute = {
  message: "void:accept-friend-request",
  execute: async ({ data, user }) => {
    if (!AcceptFriendRequestDataCompiler.Check(data)) {
      return;
    }

    const { pair } = data;

    if (user.id !== pair.addressee.id) {
      return;
    }

    try {
      await prismaClient.friend.update({
        where: {
          requesterId_addresseeId: {
            requesterId: pair.requester.id,
            addresseeId: pair.addressee.id,
          },
          status: "PENDING",
        },
        data: {
          status: "ACCEPTED",
        },
      });
    } catch (error) {
      logger.error(
        "User tried to accept a bad friend request (either doesn't exist or is not in PENDING state)",
        error,
        { pair },
      );
      return;
    }

    sendFriendsListLetter(pair.requester.id);
    sendFriendsListLetter(pair.addressee.id);
    sendPendingInvitesLetter(pair.requester.id);
    sendPendingInvitesLetter(pair.addressee.id);
  },
};

export { acceptFriendRequestHandler };
