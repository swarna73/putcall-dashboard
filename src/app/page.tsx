import Dashboard from "@/components/Dashboard";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <>
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
          <li>Cross-Platform Validation - Compare trends across Reddit, StockTwits, and Yahoo Finance</li>
        </ul>
        <h2>Why Use PutCall.nl?</h2>
        <p>
          Free alternative to expensive Bloomberg terminals. Get institutional-grade market 
          intelligence powered by AI. Updated every 5 minutes with real-time data.
        </p>
      </div>
      
      <Dashboard />
      <FAQ />
    </>
  );
}
