import "server-only";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import VerificationEmail from "./emails/verification";
import { env } from "./env";
import { logger } from "./logger";
import PasswordResetEmail from "./emails/password-reset";

// TODO: create frontend password reset page

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

const sender = `Chirra <${env.EMAIL_USER}>`;

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${env.EMAIL_APP_URL}/verify-email/${token}`;

  try {
    const emailHtml = await render(
      <VerificationEmail verificationUrl={verificationUrl} />,
    );

    await transporter.sendMail({
      from: sender,
      to,
      subject: "Verify your email",
      html: emailHtml,
    });

    logger.info("Verification email sent", { to });
  } catch (error) {
    logger.error("Failed to send verification email", error, { to });
    throw error;
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  // TODO: implement line below
  const resetUrl = `${env.EMAIL_APP_URL}/reset-password/${token}`;

  try {
    const emailHtml = await render(<PasswordResetEmail resetUrl={resetUrl} />);

    await transporter.sendMail({
      from: sender,
      to,
      subject: "Reset your password",
      html: emailHtml,
    });

    logger.info("Password reset email sent", { to });
  } catch (error) {
    logger.error("Failed to send password reset email", error, { to });
    throw error;
  }
}
