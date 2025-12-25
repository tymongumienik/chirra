import "server-only";
import Elysia from "elysia";
import { ip } from "elysia-ip";
import prismaService from "@/app/libs/db";
import { rateLimiter } from "@/app/libs/rate-limiter";
import { authMiddleware } from "../../middleware";
import { requestPasswordReset, resetPassword } from "./handlers";
import { passwordResetSchema } from "./schema";

const passwordResetRoutes = new Elysia()
  .model(passwordResetSchema)
  .use(prismaService)
  .use(authMiddleware)
  .use(ip())
  .post(
    "/request-password-reset",
    async (context) => {
      rateLimiter.check(context.ip);
      return await requestPasswordReset(context);
    },
    { body: "password-reset.request" },
  )
  .post(
    "/reset-password",
    async (context) => {
      rateLimiter.check(context.ip);
      return await resetPassword(context);
    },
    { body: "password-reset.reset" },
  );

export default passwordResetRoutes;
