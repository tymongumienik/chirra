import "server-only";
import Elysia from "elysia";
import { ip } from "elysia-ip";
import prismaService from "@/app/libs/db";
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
      rateLimiter.check(context.ip);
      return await register(context);
    },
    { body: "auth.register" },
  )
  .post(
    "/login",
    async (context) => {
      rateLimiter.check(context.ip);
      return await login(context);
    },
    { body: "auth.login" },
  )
  .get("/logout", logout)
  .get("/verify-email", verifyEmail);

export default authRoutes;
