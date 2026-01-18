'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is PutCall.nl and how does it help investors?",
    answer: "PutCall.nl is a free real-time stock market intelligence dashboard that aggregates data from Reddit (WallStreetBets), StockTwits, Yahoo Finance, and SEC filings. It helps retail investors track trending stocks, analyze market sentiment, screen for undervalued stocks, and monitor insider trading activity — all in one place, updated every few minutes."
  },
  {
    question: "How does the Reddit sentiment analysis work?",
    answer: "We track the most discussed stocks on WallStreetBets and other investing subreddits in real-time. Each stock shows mention count, sentiment score (bullish/bearish), rank changes, and trending keywords. This helps you spot retail momentum before it hits mainstream news. The data is cross-validated against StockTwits and Yahoo Finance for reliability."
  },
  {
    question: "What is Cross-Platform Validation?",
    answer: "Cross-Platform Validation compares trending stocks across Reddit, StockTwits, and Yahoo Finance simultaneously. When a stock trends on multiple platforms, it indicates stronger market interest. Stocks trending only on Reddit may carry higher risk as speculative meme plays, while multi-platform consensus suggests broader institutional awareness."
  },
  {
    question: "How does the Fundamentals Screener find value stocks?",
    answer: "Our screener filters 50+ stocks across 6 sectors (Technology, Healthcare, Energy, Financials, Consumer, Telecommunications) using value investing criteria: P/E ratio under 25, dividend yield above 2%, reasonable debt levels, and positive free cash flow. Each stock shows a conviction rating (Strong Buy, Buy, Hold) based on these fundamentals."
  },
  {
    question: "What does the Financial X-Ray tool show?",
    answer: "Enter any stock ticker to get a comprehensive fundamental analysis including P/E ratio, market cap, revenue growth, profit margins, debt-to-equity, free cash flow, and dividend yield. It's designed to help you quickly evaluate whether a stock is overvalued or undervalued compared to its sector peers."
  },
  {
    question: "How do I track insider trading and SEC filings?",
    answer: "The Insider Trading section monitors SEC Form 4 filings in real-time. When company executives, directors, or major shareholders buy or sell stock, it appears here. Insider buying often signals confidence in the company's future, while unusual selling patterns may warrant caution."
  },
  {
    question: "Is PutCall.nl free to use?",
    answer: "Yes, PutCall.nl is completely free. We built it as an alternative to expensive Bloomberg terminals and premium stock analysis tools. You get real-time market sentiment, fundamental screening, insider trading alerts, and cross-platform validation at no cost. Subscribe to our Market Brief newsletter (Mon/Wed/Fri) for updates delivered to your inbox."
  },
  {
    question: "How often is the data updated?",
    answer: "Dashboard data refreshes automatically every 2-5 minutes during market hours. Reddit sentiment updates every few minutes, market indices stream in real-time, and news feeds pull from Yahoo Finance and other major sources continuously. The refresh button forces an immediate update if needed."
  }
];

// JSON-LD Schema for the FAQ (for Google Rich Results)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* JSON-LD for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <section className="mt-8 mb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm">
              Everything you need to know about PutCall.nl
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#0f172a] border border-slate-700/50 rounded-lg overflow-hidden transition-all duration-200 hover:border-slate-600"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="px-5 pb-4 text-slate-300 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              Have more questions? Subscribe to our{' '}
              <span className="text-indigo-400">Market Brief newsletter</span>{' '}
              for weekly insights.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
