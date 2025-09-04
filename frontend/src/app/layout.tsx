import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/providers";

import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shop Flow - Sistema de Contagem de Pessoas",
  description: "Dashboard em tempo real para monitoramento de tráfego de pessoas em lojas com visão computacional",
  keywords: ["shop flow", "contagem pessoas", "analytics", "retail", "computer vision", "dashboard"],
  authors: [{ name: "Shop Flow Team" }],
  creator: "Shop Flow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://shopflow.com.br",
    siteName: "Shop Flow",
    title: "Shop Flow - Sistema de Contagem de Pessoas",
    description: "Dashboard em tempo real para monitoramento de tráfego de pessoas em lojas",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shop Flow Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Flow - Sistema de Contagem de Pessoas",
    description: "Dashboard em tempo real para monitoramento de tráfego de pessoas em lojas",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: false, // Não indexar em produção interna
    follow: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0D26" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#F8FAFC",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#F8FAFC",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#F8FAFC",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#3B82F6",
                  secondary: "#F8FAFC",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}