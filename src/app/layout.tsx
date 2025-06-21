import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Geist, Geist_Mono } from "next/font/google"
import { Comfortaa } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import TRPCProvider from "@/app/_trpc/Provider";
import { ToastProvider } from "@/contexts/toast-context";
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Talas - Showcase Your Projects",
  description: "A  web-based social media platform designed to showcase software engineering projects. Talas enables users to share, explore, and interact with innovative project portfolios in a modern and engaging way. Built for collaboration, inspiration, and growth in the tech community.",
  icons: {
    icon: "/logo/talas-logo.png",
    shortcut: "/logo/talas-logo.png",
    apple: "/logo/talas-logo.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
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
            <body className={`${inter.className} ${geistSans.variable} ${geistMono.variable} ${comfortaa.variable}`} style={{ fontFamily: 'var(--font-comfortaa), var(--font-geist-sans), sans-serif' }}>
              {children}
            </body>
          </html>
        </ToastProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
}