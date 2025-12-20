import "server-only";
import { hash, verify } from "argon2";
import type { Session } from "lucia";
import { cookies } from "next/headers";
import { lucia } from "@/app/libs/auth";
import { sendVerificationEmail } from "@/app/libs/email";
import type { WithPrisma } from "@/types/database";

// TODO: add more rigorous input validation
// TODO: replace email API responses with redirects to frontend

export const signUp = async ({
  body,
  prisma,
}: {
  body: { username: string; password: string; email: string };
} & WithPrisma) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: body.username }, { email: body.email }],
    },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Username or email taken",
    };
  }

  const passwordHash = await hash(body.password);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: body.username,
          displayname: body.username,
          email: body.email,
          password: passwordHash,
          profile: {
            create: {},
          },
          emailVerification: {
            create: {},
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

      if (!user.emailVerification) {
        throw new Error("Failed to create email verification");
      }

      await sendVerificationEmail(body.email, user.emailVerification.token);

      return user;
    });

    const session = await lucia.createSession(result.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(sessionCookie.name, sessionCookie.value);

    return {
      success: true,
    };
  } catch (e) {
    console.error("Sign up failed:", e);
    return {
      success: false,
      error: "Failed to create account",
    };
  }
};

export const signIn = async ({
  body,
  prisma,
}: {
  body: { usernameOrEmail: string; password: string };
} & WithPrisma) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: body.usernameOrEmail }, { email: body.usernameOrEmail }],
    },
    select: {
      id: true,
      password: true,
      emailVerification: true,
    },
  });

  if (!user) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  const validPassword = await verify(user.password, body.password);
  if (!validPassword) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  if (user.emailVerification !== null) {
    return {
      success: false,
      error: "Please verify your email before signing in",
    };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  (await cookies()).set(sessionCookie.name, sessionCookie.value);

  return {
    success: true,
  };
};

export const signOut = async ({ session }: { session: Session | null }) => {
  if (!session) {
    return {
      success: false,
    };
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();

  (await cookies()).set(sessionCookie.name, sessionCookie.value);

  return {
    success: true,
  };
};

export const verifyEmail = async ({
  query,
  prisma,
}: {
  query: Record<string, string>;
} & WithPrisma) => {
  if (!Object.hasOwn(query, "token")) {
    return {
      success: false,
      error: "Missing token",
    };
  }
  try {
    await prisma.emailVerification.delete({
      where: {
        token: query.token,
      },
    });
  } catch (_e) {
    return {
      success: false,
      error: "Invalid token",
    };
  }

  return {
    success: true,
  };
};
