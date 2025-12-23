import "server-only";
import type { User } from "lucia";
import type { WithPrisma } from "@/types/database";

export const whoAmI = async ({
  user,
  prisma,
}: { user: User | null } & WithPrisma) => {
  if (!user) {
    return { success: false };
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      username: true,
      displayname: true,
      email: true,
      profile: true,
      sessions: true,
    },
  });

  if (!userData) {
    return { success: false };
  }

  return { success: true, user: userData };
};
