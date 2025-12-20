import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/app/prisma/schema.prisma",
  migrations: {
    path: "src/app/prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
