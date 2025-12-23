import "server-only";
import { t } from "elysia";

export const passwordResetSchema = {
  "password-reset.request": t.Object({
    email: t.String({
      format: "email",
      maxLength: 255,
      error: "Email must be at most 255 characters long",
    }),
  }),
  "password-reset.reset": t.Object({
    token: t.String(),
    newPassword: t.String({
      minLength: 8,
      maxLength: 128,
      error: "Password must be between 8 and 128 characters",
    }),
  }),
};
