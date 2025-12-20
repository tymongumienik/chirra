import "server-only";
import { hash } from "argon2";
import { sendPasswordResetEmail } from "@/app/libs/email";
import {
  formatErrorResponse,
  NotFoundError,
  ValidationError,
} from "@/app/libs/errors";
import { logger } from "@/app/libs/logger";
import { validateEmail, validatePassword } from "@/app/libs/validation";
import type { WithPrisma } from "@/types/database";

export const requestPasswordReset = async ({
  body,
  prisma,
}: {
  body: { email: string };
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

    await prisma.passwordReset.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    const resetToken = await prisma.passwordReset.create({
      data: {
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
    if (error instanceof ValidationError) {
      return formatErrorResponse(error);
    }
    logger.error("Password reset request failed", error);
    return formatErrorResponse(new Error("Password reset request failed"));
  }
};

export const resetPassword = async ({
  body,
  prisma,
}: {
  body: { token: string; newPassword: string };
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

    const passwordHash = await hash(newPassword);

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

    logger.info("Password reset successful", { userId: resetToken.userId });

    return { success: true };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return formatErrorResponse(error);
    }
    logger.error("Password reset failed", error);
    return formatErrorResponse(new Error("Password reset failed"));
  }
};
