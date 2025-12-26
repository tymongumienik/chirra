import "server-only";
import type { User } from "lucia";
import { AuthenticationError } from "@/app/libs/errors";
import type { WithPrisma } from "@/types/database";

export const whoAmI = async ({
  user,
  prisma,
}: { user: User | null } & WithPrisma) => {
  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      username: true,
      displayname: true,
      email: true,
      profile: true,
    },
  });

  if (!userData) {
    throw new AuthenticationError("Unauthorized"); // the same error, less information is better
  }

  return { success: true, user: userData };
};
