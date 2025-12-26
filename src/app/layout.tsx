import type { Metadata } from "next";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { geistMono, geistSans, inter } from "./fonts";
import { luciaRequestData } from "./libs/lucia";
import { LuciaProvider } from "./libs/lucia-context";
import { queryClient } from "./libs/query";

export const metadata: Metadata = {
  title: "Chirra",
  description: "A full-stack chat service",
  icons: {
    icon: "/logo-white.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await luciaRequestData();

  return (
    <QueryClientProvider client={queryClient}>
      <LuciaProvider value={auth}>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </LuciaProvider>
    </QueryClientProvider>
  );
}
