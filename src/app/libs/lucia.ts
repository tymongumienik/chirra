import { cookies } from "next/headers";
import { lucia } from "./auth";

export const luciaRequestData = async () => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);

  return result;
};
