import { prismaClient } from "@/app/libs/db";
import { sendWebSocketMessageToUser } from "../../route";
import type { UserDetailsLetter } from "../shared-schema";

export async function sendUserDetailsLetter(target: string, userIds: string[]) {
  const users: (typeof UserDetailsLetter)["static"]["users"] =
    await prismaClient.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
        displayname: true,
        createdAt: true,
        profile: {
          select: {
            avatar: true,
            bio: true,
            pronouns: true,
            location: true,
          },
        },
      },
    });

  sendWebSocketMessageToUser([target], "letter:user-details", { users });
}
