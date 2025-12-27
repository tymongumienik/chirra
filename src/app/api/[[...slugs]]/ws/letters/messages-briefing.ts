import { prismaClient } from "@/app/libs/db";
import { sendWebSocketMessageToUser } from "../../route";
import type { Message } from "../shared-schema";

export async function sendDMBriefingLetter(
  userId: string,
  sideMessageUsers: string[],
) {
  const users = sideMessageUsers.slice(0, 5); // first 5 users
  const messagesByUser: Record<string, (typeof Message)["static"][]> = {};

  for (const u of users) {
    const messages = await prismaClient.message.findMany({
      where: {
        channelId: null,
        OR: [{ authorId: u }, { recipientId: u }],
      },
      orderBy: {
        createdAt: "desc", // latest first
      },
      take: 50, // only 50 messages per user
    });
    messages.reverse();

    messagesByUser[u] = messages;
  }

  sendWebSocketMessageToUser([userId], "letter:dm-briefing", {
    messages: messagesByUser,
  });
}
