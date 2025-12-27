import "server-only";
import { randomBytes } from "node:crypto";
import type { Context } from "elysia";
import { lucia } from "@/app/libs/auth";
import { sendPasswordResetEmail } from "@/app/libs/email";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/app/libs/errors";
import { logger } from "@/app/libs/logger";
import { validateEmail, validatePassword } from "@/app/libs/validation";
import type { WithPrisma } from "@/types/database";
import type { passwordResetSchema } from "./schema";

export const requestPasswordReset = async ({
  body,
  prisma,
}: {
  body: (typeof passwordResetSchema)["password-reset.request"]["static"];
} & WithPrisma) => {
  try {
    const email = body.email;
    validateEmail(email);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      logger.info("Password reset requested for non-existent email", { email });
      // sneaky :)
      return { success: true };
    }

    const existingPasswordReset = await prisma.passwordReset.findFirst({
      where: { userId: user.id },
      select: { id: true, expiresAt: true, used: true },
      orderBy: { expiresAt: "desc" },
    });

    if (existingPasswordReset) {
      if (
        !existingPasswordReset.used &&
        existingPasswordReset.expiresAt > new Date()
      ) {
        logger.info("Password reset already requested", { userId: user.id });
        return { success: true };
      }

      logger.info("Deleting old password reset token", { userId: user.id });
      await prisma.passwordReset.delete({
        where: { id: existingPasswordReset.id },
      });
    }

    const resetToken = await prisma.passwordReset.create({
      data: {
        token: randomBytes(32).toString("base64url"),
        userId: user.id,
      },
      select: {
        token: true,
      },
    });

    try {
      await sendPasswordResetEmail(email, resetToken.token);
    } catch (error) {
      logger.error("Failed to send password reset email", error, {
        userId: user.id,
      });
    }

    logger.info("Password reset requested", { userId: user.id });

    return { success: true };
  } catch (error) {
    logger.error("Password reset request failed", error);
    throw error;
  }
};

export const resetPassword = async ({
  body,
  cookie,
  prisma,
}: {
  body: (typeof passwordResetSchema)["password-reset.reset"]["static"];
  cookie: Context["cookie"];
} & WithPrisma) => {
  try {
    const { token, newPassword } = body;

    if (!token) {
      throw new ValidationError("Missing token");
    }

    validatePassword(newPassword);

    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        used: true,
      },
    });

    if (!resetToken) {
      throw new NotFoundError("Invalid or expired token");
    }

    if (resetToken.used) {
      throw new ValidationError("Token has already been used");
    }

    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordReset.delete({
        where: { id: resetToken.id },
      });
      throw new ValidationError("Token has expired");
    }

    const passwordHash = await Bun.password.hash(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      prisma.session.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    const session = await lucia.createSession(resetToken.userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookie[sessionCookie.name].set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });

    logger.info("Password reset successful", { userId: resetToken.userId });

    return { success: true };
  } catch (error) {
    logger.error("Password reset failed", error);
    throw error;
  }
};
