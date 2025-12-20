import type { PrismaClient } from "@prisma/client";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export interface DatabaseUserAttributes {
  username: string;
  displayname: string;
  avatar: string | null;
}

export type WithPrisma = {
  prisma: PrismaClient;
};
