import "server-only";
import { t } from "elysia";

export const passwordResetSchema = {
  "password-reset.request": t.Object({
    email: t.String({
      format: "email",
      maxLength: 254,
    }),
  }),
  "password-reset.reset": t.Object({
    token: t.String(),
    newPassword: t.String({
      minLength: 8,
      maxLength: 128,
    }),
  }),
};
