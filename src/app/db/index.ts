import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import Elysia from "elysia";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({ adapter });

const prismaService = new Elysia({ name: "prismaService" }).decorate({
  prisma: prismaClient,
});

export default prismaService;
