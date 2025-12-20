import { PrismaClient } from "@prisma/client";
import Elysia from "elysia";

export type WithPrisma = {
  prisma: typeof prismaClient;
};

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({ adapter });

const prismaService = new Elysia({ name: "prismaService" }).decorate({
  prisma: prismaClient,
});

export default prismaService;
