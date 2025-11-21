import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "PutCall.nl | Intelligent Market Dashboard",
  description: "Real-time financial dashboard featuring Reddit sentiment analysis, breaking news from Bloomberg/Reuters, and AI-driven deep value stock picks.",
  openGraph: {
    type: "website",
    url: "https://putcall.nl/",
    title: "PutCall.nl - AI Market Intelligence",
    description: "Track the hype vs. the fundamentals. AI-curated Reddit trends, critical Reuters headlines, and deep value stock picks.",
    images: ["https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=1200"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PutCall.nl - AI Market Intelligence",
    description: "Track the hype vs. the fundamentals. AI-curated Reddit trends, critical Reuters headlines, and deep value stock picks.",
    images: ["https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=1200"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-[#020617] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}