import "server-only";
import Elysia from "elysia";
import { ip } from "elysia-ip";
import prismaService from "@/app/db";
import { formatErrorResponse } from "@/app/libs/errors";
import { rateLimiter } from "@/app/libs/rate-limiter";
import { authMiddleware } from "../middleware";
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
      try {
        rateLimiter.check(context.ip);
        return await requestPasswordReset(context);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
    { body: "password-reset.request" },
  )
  .post(
    "/reset-password",
    async (context) => {
      try {
        rateLimiter.check(context.ip);
        return await resetPassword(context);
      } catch (error) {
        return formatErrorResponse(error);
      }
    },
    { body: "password-reset.reset" },
  );

export default passwordResetRoutes;
