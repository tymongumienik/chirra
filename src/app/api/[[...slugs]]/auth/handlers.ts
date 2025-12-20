import type { Session } from "lucia";
import type { WithPrisma } from "@/app/db";
import { hash, verify } from "argon2";
import { lucia } from "@/app/libs/auth";
import { cookies, headers } from "next/headers";

// TODO: add more rigorous input validation

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

  try {
    const user = await prisma.user.create({
      data: {
        username: body.username,
        displayname: body.username,
        email: body.email,
        password: passwordHash,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(sessionCookie.name, sessionCookie.value);

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      error: "Unknown error",
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
