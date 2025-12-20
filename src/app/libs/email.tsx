import "server-only";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "./logger";

// TODO: create frontend password verify/reset pages

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

const VerificationEmail = ({
  verificationUrl,
}: {
  verificationUrl: string;
}) => (
  <Html>
    <Head />
    <Preview>Verify your email to complete registration</Preview>
    <Body
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f0f0f0",
        margin: 0,
        padding: 0,
      }}
    >
      <Container
        style={{
          margin: "40px auto",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
        }}
      >
        <Heading style={{ color: "#333333", fontSize: "24px" }}>
          Verify Your Email
        </Heading>
        <Text style={{ color: "#555555", fontSize: "16px" }}>
          Click the button below to verify your email and finish setting up your
          account.
        </Text>
        <a
          href={verificationUrl}
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 24px",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "6px",
          }}
        >
          Verify Email
        </a>
        <Text style={{ marginTop: "20px", color: "#999999", fontSize: "12px" }}>
          If you did not create this account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

const PasswordResetEmail = ({ resetUrl }: { resetUrl: string }) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f0f0f0",
        margin: 0,
        padding: 0,
      }}
    >
      <Container
        style={{
          margin: "40px auto",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
        }}
      >
        <Heading style={{ color: "#333333", fontSize: "24px" }}>
          Reset Your Password
        </Heading>
        <Text style={{ color: "#555555", fontSize: "16px" }}>
          Click the button below to reset your password. This link will expire
          in 1 hour.
        </Text>
        <a
          href={resetUrl}
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 24px",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "6px",
          }}
        >
          Reset Password
        </a>
        <Text style={{ marginTop: "20px", color: "#999999", fontSize: "12px" }}>
          If you did not request a password reset, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export async function sendVerificationEmail(to: string, token: string) {
  // TODO: implement line below
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
