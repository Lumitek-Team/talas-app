// src/app/layout.tsx
/**
 * Root layout for the entire Talas application.
 *
 * Provider order is CRITICAL:
 * 1. ClerkProvider (outermost — manages authentication)
 * 2. TRPCProvider (depends on Clerk context for auth tokens)
 * 3. ToastProvider (manages toast notifications)
 *
 * If order is wrong, child components won't have access to auth or tRPC.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import { Comfortaa } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import TRPCProvider from "@/app/_trpc/Provider";
import { ToastProvider } from "@/contexts/toast-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Talas — Portfolio for Creators",
    template: "%s | Talas",
  },
  description:
    "Showcase your work, document your process, collaborate with other creators.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "Talas",
    images: [
      {
        url: "/logo/talas-logo.png",
        width: 1200,
        height: 630,
        alt: "Talas — Portfolio for Creators",
      },
    ],
  },
  icons: {
    icon: "/logo/talas-logo.png",
    shortcut: "/logo/talas-logo.png",
    apple: "/logo/talas-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/feeds"
      signUpFallbackRedirectUrl="/feeds"
    >
      <TRPCProvider>
        <ToastProvider>
          <html lang="en" className="dark">
            <head>
              <link
                rel="icon"
                href="/logo/talas-logo.png"
                sizes="48x48"
                type="image/png"
              />
              <link rel="apple-touch-icon" href="/logo/talas-logo.png" />
            </head>
            <body
              className={`${inter.className} ${geistSans.variable} ${geistMono.variable} ${comfortaa.variable}`}
              style={{
                fontFamily:
                  "var(--font-comfortaa), var(--font-geist-sans), sans-serif",
              }}
            >
              {children}
            </body>
          </html>
        </ToastProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
}
