import "server-only";
import cors, { type HTTPMethod } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "@/app/libs/env";
import authRoutes from "./auth";
import { authMiddleware } from "./middleware";
import passwordResetRoutes from "./password-reset";
import sessionRoutes from "./sessions";
import userRoutes from "./user";

const corsConfig = {
  origin: env.IS_PRODUCTION ? env.ALLOWED_ORIGINS?.split(",") : true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"] as HTTPMethod[],
  allowedHeaders: "*",
  exposedHeaders: "*",
  maxAge: 5,
  credentials: true,
};

const app = new Elysia({ prefix: "/api" })
  .use(cors(corsConfig))
  .use(authMiddleware)
  .use(authRoutes)
  .use(userRoutes)
  .use(passwordResetRoutes)
  .use(sessionRoutes);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;

export type API = typeof app;
