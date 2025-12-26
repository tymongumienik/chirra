import { prismaClient } from "@/app/libs/db";
import { sendWebSocketMessageToUser } from "../../route";
import { sendUserDetailsLetter } from "./user-details";

export async function sendFriendsListLetter(userId: string): Promise<string[]> {
  const friends = await prismaClient.friend.findMany({
    where: {
      OR: [
        {
          requesterId: userId,
        },
        {
          addresseeId: userId,
        },
      ],

      status: "ACCEPTED",
    },
    select: {
      requesterId: true,
      addresseeId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const friendsList = friends.map((friend) =>
    friend.requesterId === userId ? friend.addresseeId : friend.requesterId,
  );

  sendUserDetailsLetter(userId, friendsList);
  sendWebSocketMessageToUser([userId], "letter:friends-list", {
    friends: friendsList,
  });

  return friendsList;
}
