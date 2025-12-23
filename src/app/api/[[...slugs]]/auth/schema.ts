import "server-only";
import { t } from "elysia";

export const authSchema = {
  "auth.register": t.Object({
    username: t.String({
      minLength: 3,
      maxLength: 30,
      pattern: "^[a-zA-Z0-9_]+$",
      error:
        "Username must be between 3 and 30 characters long and contain only letters, numbers, and underscores",
    }),
    password: t.String({
      minLength: 8,
      maxLength: 128,
      error: "Password must be between 8 and 128 characters long",
    }),
    email: t.String({
      format: "email",
      maxLength: 255,
      error: "Email must be at most 255 characters long",
    }),
  }),
  "auth.login": t.Object({
    usernameOrEmail: t.String(),
    password: t.String(),
  }),
};
