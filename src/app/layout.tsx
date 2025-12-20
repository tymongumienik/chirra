import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chirra",
  description: "A full-stack chat service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
