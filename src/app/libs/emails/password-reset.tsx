import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

const PasswordResetEmail = ({ resetUrl }: { resetUrl: string }) => (
  <Html>
    <Head />
    <Preview>Click the button to reset your password</Preview>
    <Body
      style={{
        fontFamily: "Geist, Inter, Roboto, sans-serif",
        backgroundColor: "#030712",
        margin: 0,
        padding: 0,
      }}
    >
      <Container
        style={{
          margin: "60px auto",
          padding: "20px",
          backgroundColor: "#050B17",
          borderRadius: "8px",
          border: "1px solid #121418",
        }}
      >
        <Heading
          style={{
            textAlign: "center",
            color: "#DEE8FB",
            fontSize: "26px",
          }}
        >
          Reset your Chirra password
        </Heading>
        <Text
          style={{ textAlign: "center", color: "#cccccc", fontSize: "16px" }}
        >
          Click the button below to reset your password.
          <br />
          This link will expire in 30 minutes.
        </Text>
        <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
          <tr>
            <td align="center">
              <a
                href={resetUrl}
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#134CBC",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Reset Password
              </a>
            </td>
          </tr>
        </table>
        <Text
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#4C5569",
            fontSize: "12px",
          }}
        >
          If you did not request a password reset, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;
