import { t } from "elysia";

export const authSchema = {
  "auth.sign-up": t.Object({
    username: t.String({
      minLength: 5,
      pattern: "^[a-zA-Z0-9_]+$",
      error: "Username must be 5+ characters and alphanumeric",
    }),
    password: t.String({
      minLength: 8,
      maxLength: 64,
    }),
    email: t.String({
      format: "email",
    }),
  }),
  "auth.sign-in": t.Object({
    usernameOrEmail: t.String(),
    password: t.String(),
  }),
};
