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

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const VerificationEmail = ({
  verificationUrl,
}: {
  verificationUrl: string;
}) => (
  <Html>
    <Head />
    <Preview>Verify your email to complete registration</Preview>
    <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f0f0f0", margin: 0, padding: 0 }}>
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

export async function sendVerificationEmail(to: string, token: string) {
  // if (!process.env.EMAIL_APP_URL) throw new Error("EMAIL_APP_URL not set");

  const verificationUrl = `${process.env.EMAIL_APP_URL}/verify?token=${token}`;

  const emailHtml = await render(<VerificationEmail verificationUrl={verificationUrl} />);

  await transporter.sendMail({
    from: `Chirra <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email",
    html: emailHtml,
  });
}
