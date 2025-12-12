import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { config } from "@/lib/config";
import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import { Suspense } from "react";

const defaultUrl = config.vercel.url
  ? `https://${config.vercel.url}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "TOTP Storage - Secure OTP Management for Automation Testing",
  description: "Securely store and manage TOTP codes for seamless automation testing with tools like Postman, Apidog, and others. Access your OTP tokens anywhere with our cloud-based 2FA solution.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}