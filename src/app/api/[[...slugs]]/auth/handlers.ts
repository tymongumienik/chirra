import { Session } from "lucia";
import { WithPrisma } from "@/app/db";

export const signUp = async ({
  body,
  prisma,
}: {
  body: { username: string; password: string };
} & WithPrisma) => {};

export const signIn = async ({
  body,
  prisma,
}: {
  body: { username: string; password: string };
} & WithPrisma) => {};

export const signOut = async ({ session }: { session: Session | null }) => {};
