import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { lucia } from "../../libs/auth";

export async function GET() {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return NextResponse.json({ user: null, session: null });
  }

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
    (await cookies()).delete(lucia.sessionCookieName);
  }

  return NextResponse.json(result);
}
