import Dashboard from "@/components/Dashboard";

// FAQ Schema for Google Rich Results
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Compare top AI stock analyzers by accuracy and cost",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For 2026, Zen Ratings (WallStreetZen) and Danelfin stand out for published backtested outperformance at moderate cost. Trade Ideas, TrendSpider, and Tickeron are generally pricier, trader-oriented tools where results depend heavily on the user's strategy and execution. No platform can guarantee future returns, so compare backtests, features, time horizon fit, and total cost against your style and budget."
      }
    },
    {
      "@type": "Question",
      "name": "How do AI analyzers use news and sentiment data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI stock analyzers ingest text from sources like news articles, earnings-call transcripts, social media, forums, and analyst reports. They use NLP to classify sentiment (positive/neutral/negative) and often score intensity (e.g., -1 to +1). Aggregated sentiment trends are then linked to tickers or sectors and combined with fundamentals and price data to generate signals; sudden sentiment shifts can flag events before price fully reacts. Sentiment works best as one input among many, not a standalone predictor."
      }
    },
    {
      "@type": "Question",
      "name": "Best AI stock tools for long term investors",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Long-term investors generally benefit most from research-first, multi-factor tools that emphasize fundamentals, valuation, and quality alongside momentum. Zen Ratings (WallStreetZen) provides simple A–F grades using 115+ factors, which can suit multi-month to multi-year holding periods. Danelfin can also work for longer horizons, but it is explicitly optimized for ~3-month outperformance; treat it as a signal layer and validate it against your own fundamental thesis, diversification needs, and risk tolerance."
      }
    },
    {
      "@type": "Question",
      "name": "How to validate AI stock predictions historically",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Validate AI signals with a rules-based backtest: define entry/exit rules (e.g., buy rating >= X, hold Y months), specify rebalancing, position sizing, and transaction costs, then test across long historical periods. Compare to relevant benchmarks and evaluate not only returns but also drawdowns, volatility, turnover, and consistency. Avoid survivorship and look-ahead bias by using only information available at each point in time and including delisted names. Use out-of-sample and walk-forward testing to reduce overfitting risk."
      }
    },
    {
      "@type": "Question",
      "name": "Risks and limitations of AI stock analysis models",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI models are limited by the data they learn from and can fail during regime changes or rare events. Markets are noisy and non-stationary, so patterns can weaken or invert over time. Some tools are black boxes, which can encourage overconfidence and misuse. As more participants adopt similar signals, any edge may get arbitraged away, while slippage and transaction costs can erode results. Use AI as a decision aid, size positions conservatively, and track live performance."
      }
    }
  ]
};

export default function Home() {
  return (
    <>
      {/* FAQ Schema for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Hidden SEO content - helps Google understand the page */}
      <div className="sr-only">
        <h1>PutCall.nl - Real-Time Stock Market Intelligence Dashboard</h1>
        <p>
          Track Reddit stock sentiment from WallStreetBets, monitor SEC insider trading 
          alerts, analyze stock fundamentals, and stay updated with breaking financial news. 
          Our AI-powered dashboard provides real-time market intelligence to help you make 
          informed investment decisions.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Reddit Stock Sentiment Analysis - Track the most discussed stocks on WallStreetBets</li>
          <li>Insider Trading Alerts - Monitor SEC Form 4 filings and smart money moves</li>
          <li>Fundamental Stock Screener - Find undervalued stocks with strong financials</li>
          <li>Financial X-Ray - Deep dive analysis of any stock ticker</li>
          <li>Breaking Market News - Real-time updates from Bloomberg, Reuters, and CNBC</li>
        </ul>
        <h2>Why Use PutCall.nl?</h2>
        <p>
          Free alternative to expensive Bloomberg terminals. Get institutional-grade market 
          intelligence powered by AI. Updated every 5 minutes with real-time data.
        </p>
      </div>
      
      <Dashboard />
    </>
  );
}
