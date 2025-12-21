import "server-only";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { prismaClient } from "./db";

const adapter = new PrismaAdapter(prismaClient.session, prismaClient.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

export const luciaRequestData = cache(async () => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) return { user: null, session: null };

  const result = await lucia.validateSession(sessionId);

  if (result.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  return result;
});
