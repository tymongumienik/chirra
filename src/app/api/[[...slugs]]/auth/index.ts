import "server-only";
import Elysia from "elysia";
import { ip } from "elysia-ip";
import prismaService from "@/app/libs/db";
import { formatErrorResponse } from "@/app/libs/errors";
import { rateLimiter } from "@/app/libs/rate-limiter";
import { authMiddleware } from "../middleware";
import { login, logout, register, verifyEmail } from "./handlers";
import { authSchema } from "./schema";

const authRoutes = new Elysia()
  .model(authSchema)
  .use(prismaService)
  .use(authMiddleware)
  .use(ip())
  .post(
    "/register",
    async (context) => {
      try {
        rateLimiter.check(context.ip);
        return await register(context);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
    { body: "auth.register" },
  )
  .post(
    "/login",
    async (context) => {
      try {
        rateLimiter.check(context.ip);
        return await login(context);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
    { body: "auth.login" },
  )
  .get("/sign-out", logout)
  .get("/verify-email", verifyEmail);

export default authRoutes;
