import type { Metadata } from "next";
import "./globals.css";
import { geistMono, geistSans, inter } from "./fonts";
import { luciaRequestData } from "./libs/auth";
import { LuciaProvider } from "./libs/lucia-context";

export const metadata: Metadata = {
  title: "Chirra",
  description: "A full-stack chat service",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await luciaRequestData();

  return (
    <LuciaProvider value={auth}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </LuciaProvider>
  );
}
