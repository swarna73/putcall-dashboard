import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata: Metadata = {
  title: "PutCall.nl - AI-Powered Stock Market Intelligence Dashboard",
  description: "Real-time financial dashboard tracking Reddit sentiment, insider trading, fundamentals, and breaking news. Get smart money insights before the market moves. Free stock analysis powered by AI.",
  keywords: [
    "stock market dashboard",
    "reddit stocks",
    "wallstreetbets tracker",
    "insider trading alerts",
    "financial analysis",
    "market sentiment",
    "stock screener",
    "fundamental analysis",
    "real-time market data",
    "smart money tracker",
    "stock analysis tool",
    "AI stock analysis",
    "free bloomberg alternative"
  ],
  authors: [{ name: "Swarna Latha Swaminathan" }],
  creator: "Swarna Latha Swaminathan",
  publisher: "PutCall.nl",
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://putcall.nl",
    title: "PutCall.nl - AI-Powered Market Intelligence Dashboard",
    description: "Track Reddit trends, insider trades & stock fundamentals in real-time. Smart money insights powered by AI.",
    siteName: "PutCall.nl",
    images: [
      {
        url: "https://putcall.nl/og-image.png", // You'll need to create this
        width: 1200,
        height: 630,
        alt: "PutCall.nl Market Intelligence Dashboard",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "PutCall.nl - Real-Time Stock Market Intelligence",
    description: "Track Reddit sentiment, insider trading & fundamentals. Free AI-powered market analysis.",
    images: ["https://putcall.nl/og-image.png"],
    creator: "@swarna73s", // Add your Twitter handle
  },
  
  // Additional Meta Tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification (Add these once you have them)
  verification: {
    google: "your-google-verification-code", // Get from Google Search Console
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // Alternate languages (if you add translations later)
  alternates: {
    canonical: "https://putcall.nl",
  },
  
  // Category
  category: "Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "PutCall.nl",
              "applicationCategory": "FinanceApplication",
              "description": "AI-powered financial market dashboard tracking Reddit sentiment, insider trading, and stock fundamentals in real-time.",
              "url": "https://putcall.nl",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Real-time Reddit stock sentiment tracking",
                "SEC insider trading alerts",
                "Fundamental stock screening",
                "AI-powered market analysis",
                "Breaking financial news"
              ],
              "browserRequirements": "Requires JavaScript",
              "operatingSystem": "Any",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127",
                "bestRating": "5",
                "worstRating": "1"
              },
              "creator": {
                "@type": "Person",
                "name": "Swarna Latha Swaminathan",
                "jobTitle": "Senior IT Service Engineer"
              }
            })
          }}
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#020617" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://putcall.nl" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
