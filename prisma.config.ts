import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}` +
        `@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`,
  },
});
