import "server-only";
import { randomBytes } from "node:crypto";
import type { Context } from "elysia";
import type { Session } from "lucia";
import { lucia } from "@/app/libs/auth";
import { sendVerificationEmail } from "@/app/libs/email";
import {
  AuthenticationError,
  ConflictError,
  type ErrorResponse,
  NotFoundError,
  ValidationError,
} from "@/app/libs/errors";
import { logger } from "@/app/libs/logger";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/app/libs/validation";
import type { WithPrisma } from "@/types/database";
import type { authSchema } from "./schema";

export const register = async ({
  body,
  prisma,
}: {
  body: (typeof authSchema)["auth.register"]["static"];
} & WithPrisma): Promise<ErrorResponse | { success: true }> => {
  try {
    const username = body.username;
    const email = body.email;
    const password = body.password;

    validateUsername(username);
    validateEmail(email);
    validatePassword(password);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictError("Username is already taken");
      }
      throw new ConflictError("Email is already registered");
    }

    const passwordHash = await Bun.password.hash(password);

    // Create user and send verification email in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          displayname: username,
          email,
          password: passwordHash,
          profile: {
            create: {},
          },
          emailVerification: {
            create: {
              token: randomBytes(32).toString("base64url"),
            },
          },
        },
        select: {
          id: true,
          emailVerification: {
            select: {
              token: true,
            },
          },
        },
      });

      if (!newUser.emailVerification) {
        throw new Error("Failed to create email verification");
      }
      await sendVerificationEmail(email, newUser.emailVerification.token);

      return newUser;
    });

    logger.info("User registered", { userId: user.id, username });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Registration failed", error);
    throw error;
  }
};

export const login = async ({
  body,
  prisma,
  cookie,
}: {
  body: (typeof authSchema)["auth.login"]["static"];
  cookie: Context["cookie"];
} & WithPrisma): Promise<ErrorResponse | { success: true }> => {
  try {
    const usernameOrEmail = body.usernameOrEmail;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
      select: {
        id: true,
        username: true,
        password: true,
        emailVerification: true,
      },
    });

    if (!user) {
      const _ = await Bun.password.verify(
        body.password,
        "$argon2id$v=19$m=65536,t=2,p=1$j25bruKXS3Rzdba3jkTD5Jb1MJUpbRlBBjjPBEYu3VU$bFe8LjCq9FqI7iyY/54l4+gSR1PtQmDFJEjNgBC0NEo",
      ); // Timing attack protection
      throw new AuthenticationError();
    }

    const validPassword = await Bun.password.verify(
      body.password,
      user.password,
    );
    if (!validPassword) {
      throw new AuthenticationError();
    }

    if (user.emailVerification !== null) {
      throw new ValidationError("Please verify your email before signing in");
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookie[sessionCookie.name].set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });

    logger.info("User logged in", { userId: user.id, username: user.username });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Login failed", error);
    throw error;
  }
};

export const logout = async ({
  session,
  cookie,
}: {
  session: Session | null;
  cookie: Context["cookie"];
}) => {
  try {
    if (!session) {
      throw new AuthenticationError("No active session");
    }

    await lucia.invalidateSession(session.id);
    cookie[lucia.sessionCookieName].remove();

    logger.info("User logged out", { userId: session.userId });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Logout failed", error);
    throw error;
  }
};

export const verifyEmail = async ({
  query,
  prisma,
  cookie,
}: {
  query: Record<string, string>;
  cookie: Context["cookie"];
} & WithPrisma) => {
  try {
    if (!Object.hasOwn(query, "token")) {
      throw new ValidationError("Missing token");
    }

    const token = query.token;

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      select: {
        userId: true,
        expiresAt: true,
      },
    });

    if (!verification) {
      throw new NotFoundError("Invalid or expired token");
    }

    if (new Date() > verification.expiresAt) {
      await prisma.emailVerification.delete({
        where: { token },
      });
      throw new ValidationError("Token has expired");
    }

    // Delete verification record (marks email as verified)
    await prisma.emailVerification.delete({
      where: { token },
    });

    const session = await lucia.createSession(verification.userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookie[sessionCookie.name].set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });

    logger.info("Email verified", { userId: verification.userId });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Email verification failed", error);
    throw error;
  }
};
