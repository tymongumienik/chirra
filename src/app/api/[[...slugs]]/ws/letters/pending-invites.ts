import { prismaClient } from "@/app/libs/db";
import { sendWebSocketMessageToUser } from "../../route";
import type { PendingInvitesLetter } from "../shared-schema";
import { sendUserDetailsLetter } from "./user-details";

export async function sendPendingInvitesLetter(userId: string) {
  const invites: (typeof PendingInvitesLetter)["static"]["invites"] =
    await prismaClient.friend.findMany({
      where: {
        OR: [
          {
            requesterId: userId,
            status: "PENDING",
          },
          {
            addresseeId: userId,
            status: "PENDING",
          },
        ],
      },
      select: {
        requester: {
          select: {
            id: true,
          },
        },
        addressee: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const ids = [
    ...invites.map((invite) => invite.requester.id),
    ...invites.map((invite) => invite.addressee.id),
  ];

  sendUserDetailsLetter(userId, ids);
  sendWebSocketMessageToUser([userId], "letter:pending-invites", { invites });
}
