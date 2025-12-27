import { prismaClient } from "@/app/libs/db";
import { sendWebSocketMessageToUser } from "../../route";

export async function sideMessagesLetter(userId: string) {
  const messages = await prismaClient.message.findMany({
    where: {
      channelId: null,
      OR: [
        {
          authorId: userId,
        },
        {
          recipientId: userId,
        },
      ],
    },
    take: 50,
    orderBy: {
      createdAt: "desc",
    },
  });

  const seen = new Set<string>();

  const uniqueByUser = messages.flatMap((m) => {
    if (!m.recipientId || !m.authorId) return [];
    const otherUser = m.authorId === userId ? m.recipientId : m.authorId;

    if (seen.has(otherUser)) return [];
    seen.add(otherUser);
    return [otherUser];
  });

  sendWebSocketMessageToUser([userId], "letter:side-messages", {
    users: uniqueByUser,
  });
}
