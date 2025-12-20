import "server-only";
import { t } from "elysia";

export const authSchema = {
  "auth.register": t.Object({
    username: t.String({
      minLength: 3,
      maxLength: 30,
      pattern: "^[a-zA-Z0-9_]+$",
    }),
    password: t.String({
      minLength: 8,
      maxLength: 128,
    }),
    email: t.String({
      format: "email",
      maxLength: 254,
    }),
  }),
  "auth.login": t.Object({
    usernameOrEmail: t.String(),
    password: t.String(),
  }),
};
