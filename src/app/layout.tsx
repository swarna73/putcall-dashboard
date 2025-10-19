import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PUTCALL.NL - AI Market Sentiment Intelligence",
  description: "AI-powered market sentiment analysis combining news analysis with financial fundamentals. Real-time trading signals for informed investment decisions.",
  keywords: "market sentiment, stock analysis, AI trading signals, financial news analysis, investment intelligence",
  authors: [{ name: "Swarnalatha Swaminathan" }],
  openGraph: {
    title: "PUTCALL.NL - AI Market Sentiment Intelligence",
    description: "AI-powered market sentiment analysis for smarter trading decisions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
