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
  const usernameExists = await prisma.user.findUnique({
    where: {
      username: body.username,
    },
  });

  if (usernameExists) {
    return {
      success: false,
      error: "Username taken",
    };
  }

  const emailExists = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (emailExists) {
    return {
      success: false,
      error: "Email taken",
    };
  }

  const passwordHash = await hash(body.password);

  let user: { id: string; emailVerification: { token: string } };

  try {
    user = (await prisma.user.create({
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
        emailVerification: true,
      },
    })) as { id: string; emailVerification: { token: string } };
  } catch (_e) {
    return {
      success: false,
      error: "Unknown error",
    };
  }

  try {
    await sendVerificationEmail(body.email, user.emailVerification.token);
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(sessionCookie.name, sessionCookie.value);
  } catch (_e) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return {
      success: false,
      error: "Unknown error",
    };
  }

  return {
    success: true,
  };
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
