import type { PrismaClient } from "@prisma/client";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export interface DatabaseUserAttributes {
  username: string;
}

export type WithPrisma = {
  prisma: PrismaClient;
};

export type LuciaContextValue = {
  user: User | null;
  session: Session | null;
};
