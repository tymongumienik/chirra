import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import Elysia from "elysia";
import { Pool } from "pg";
import { env } from "./env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30 * 1000, // Close idle after 30 seconds
  connectionTimeoutMillis: 2 * 1000, // Timeout after 2 seconds
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({ adapter });

const prismaService = new Elysia({ name: "prismaService" }).decorate({
  prisma: prismaClient,
});

export default prismaService;
