import { DatabaseUserAttributes } from "@/app/libs/auth";

export const whoAmI = ({
  user,
}: {
  user: (DatabaseUserAttributes & { id: string }) | null;
}) => {
  if (!user) {
    return { success: false };
  }

  return { success: true, user };
};
