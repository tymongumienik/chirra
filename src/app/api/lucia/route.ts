"use server";

import { cookies } from "next/headers";
import { lucia } from "../../libs/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) return NextResponse.json({ user: null, session: null });

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

  return NextResponse.json(result);
}
