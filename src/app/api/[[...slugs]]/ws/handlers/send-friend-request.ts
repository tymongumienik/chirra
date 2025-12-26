import type { WebSocketRoute } from "@/app/api";
import {
  SendFriendRequestDataCompiler,
  type SendFriendRequestResponse,
} from "../shared-schema";
import { prismaClient } from "@/app/libs/db";
import { sendPendingInvitesLetter } from "../letters/pending-invites";

const sendFriendRequestHandler: WebSocketRoute = {
  message: "over:send-friend-request",
  execute: async ({ data, reply, user }) => {
    if (!SendFriendRequestDataCompiler.Check(data)) {
      return;
    }

    const requestingUser = user.id;
    const { username } = data;

    const targetUser = await prismaClient.user.findUnique({
      where: {
        username,
      },
    });

    let response: (typeof SendFriendRequestResponse)["static"];

    if (!targetUser) {
      response = {
        success: false,
        error: "User not found",
      };
    } else if (targetUser.id === requestingUser) {
      response = {
        success: false,
        error: "You cannot send a friend request to yourself. :(",
      };
    } else {
      const existingRequest = await prismaClient.friend.findFirst({
        where: {
          OR: [
            {
              requesterId: requestingUser,
              addresseeId: targetUser.id,
            },
            {
              requesterId: targetUser.id,
              addresseeId: requestingUser,
            },
          ],
          status: {
            in: ["PENDING", "ACCEPTED", "BLOCKED"],
          },
        },
      });

      if (existingRequest) {
        response = {
          success: false,
          error: {
            PENDING:
              existingRequest.requesterId === requestingUser
                ? "You have already sent a friend request to this user!"
                : "This user has already invited you!",
            ACCEPTED: "You are already friends with this user!",
            BLOCKED:
              existingRequest.requesterId === requestingUser
                ? "Unblock this user before sending them a friend request!"
                : "This user has blocked you.",
          }[existingRequest.status],
        };
      } else {
        await prismaClient.friend.create({
          data: {
            requesterId: requestingUser,
            addresseeId: targetUser.id,
            status: "PENDING",
          },
        });

        await sendPendingInvitesLetter(requestingUser);
        await sendPendingInvitesLetter(targetUser.id);

        response = {
          success: true,
        };
      }
    }

    reply("response:send-friend-request", response);
  },
};

export { sendFriendRequestHandler };
