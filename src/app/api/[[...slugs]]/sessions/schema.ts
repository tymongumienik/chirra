import "server-only";
import { t } from "elysia";

export const sessionSchema = {
  "session.revoke": t.Object({
    sessionId: t.String(),
  }),
};
