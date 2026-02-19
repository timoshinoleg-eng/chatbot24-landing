import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ChatBot24 — Умные чат-боты для бизнеса",
    template: "ChatBot24 Studio — %s",
  },
  description:
    "Создаем интеллектуальных Telegram и VK ботов для автоматизации бизнеса. Продажи, поддержка, запись — 24/7.",
  keywords: [
    "чат-бот",
    "Telegram бот",
    "VK бот",
    "автоматизация",
    "бизнес",
    "ChatBot24",
  ],
  authors: [{ name: "ChatBot24" }],
  creator: "ChatBot24",
  metadataBase: new URL("https://chatbot24.su"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "ChatBot24",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

// JSON-LD Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ChatBot24 Studio",
  url: "https://chatbot24.ru",
  logo: "https://chatbot24.ru/logo.png",
  sameAs: ["https://t.me/ChatBot24su_bot"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@chatbot24.su",
    availableLanguage: ["Russian"],
  },
  description:
    "Создаем интеллектуальных чат-ботов для автоматизации бизнеса. Продажи, поддержка, запись — 24/7.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
