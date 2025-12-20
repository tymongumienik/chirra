import "server-only";
import type { User } from "lucia";

export const whoAmI = ({ user }: { user: User | null }) => {
  if (!user) {
    return { success: false };
  }

  return { success: true, user };
};
