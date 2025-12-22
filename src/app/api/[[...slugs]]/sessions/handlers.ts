import "server-only";
import type { Context } from "elysia";
import type { Session, User } from "lucia";
import { lucia } from "@/app/libs/auth";
import {
  AppError,
  AuthenticationError,
  formatErrorResponse,
  NotFoundError,
} from "@/app/libs/errors";
import { logger } from "@/app/libs/logger";
import type { WithPrisma } from "@/types/database";

export const listSessions = async ({
  user,
  session,
  prisma,
}: {
  user: User | null;
  session: Session | null;
} & WithPrisma) => {
  try {
    if (!user || !session) {
      throw new AuthenticationError("Not authenticated");
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        expiresAt: true,
      },
      orderBy: {
        expiresAt: "desc",
      },
    });

    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.id === session.id,
    }));

    logger.info("Sessions listed", { userId: user.id, count: sessions.length });

    return {
      success: true,
      sessions: sessionsWithCurrent,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return formatErrorResponse(error);
    }
    logger.error("Failed to list sessions", error);
    return formatErrorResponse(new Error("Failed to list sessions"));
  }
};

export const revokeSession = async ({
  user,
  session,
  body,
  prisma,
  cookie,
}: {
  user: User | null;
  session: Session | null;
  body: { sessionId: string };
  cookie: Context["cookie"];
} & WithPrisma) => {
  try {
    if (!user || !session) {
      throw new AuthenticationError("Not authenticated");
    }

    const { sessionId } = body;

    const targetSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true, id: true },
    });

    if (!targetSession) {
      throw new NotFoundError("Session not found");
    }

    if (targetSession.userId !== user.id) {
      throw new AuthenticationError("Cannot revoke another user's session");
    }

    await lucia.invalidateSession(sessionId);
    if (sessionId === session.id) {
      cookie[lucia.sessionCookieName].remove();
    }

    logger.info("Session revoked", {
      userId: user.id,
      sessionId,
      wasCurrent: sessionId === session.id,
    });

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return formatErrorResponse(error);
    }
    logger.error("Failed to revoke session", error);
    return formatErrorResponse(new Error("Failed to revoke session"));
  }
};

export const revokeAllSessions = async ({
  user,
  session,
  prisma,
}: {
  user: User | null;
  session: Session | null;
} & WithPrisma) => {
  try {
    if (!user || !session) {
      throw new AuthenticationError("Not authenticated");
    }

    const result = await prisma.session.deleteMany({
      where: {
        userId: user.id,
        NOT: {
          id: session.id,
        },
      },
    });

    logger.info("All other sessions revoked", {
      userId: user.id,
      count: result.count,
    });

    return {
      success: true,
      revokedCount: result.count,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return formatErrorResponse(error);
    }
    logger.error("Failed to revoke all sessions", error);
    return formatErrorResponse(new Error("Failed to revoke all sessions"));
  }
};
