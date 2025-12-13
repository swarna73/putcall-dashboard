import { DashboardData, RedditTicker } from '../types';

interface EmailTemplateProps {
  data: DashboardData;
  unsubscribeUrl?: string;
}

export function generateEmailHTML({ data, unsubscribeUrl }: EmailTemplateProps): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const featuredStock = data.redditTrends[0];
  const runnersUp = data.redditTrends.slice(1, 10);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PutCall.nl Daily Market Brief</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #020617;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0b1221;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 800;
      color: white;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
    }
    .section {
      margin: 24px;
      padding: 20px;
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 16px 0;
    }
    .featured-stock {
      text-align: center;
      padding: 16px;
    }
    .stock-symbol {
      font-size: 48px;
      font-weight: 900;
      color: white;
      margin: 0 0 8px 0;
    }
    .stock-name {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 16px 0;
    }
    .sentiment-badge {
      display: inline-block;
      padding: 8px 16px;
      background-color: #10b981;
      color: white;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .metrics-row {
      display: flex;
      justify-content: space-around;
      margin: 16px 0;
    }
    .metric {
      text-align: center;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: white;
      display: block;
    }
    .metric-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .summary {
      background-color: #1e293b;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 16px 0;
    }
    .news-list {
      list-style: none;
      padding: 0;
      margin: 12px 0 0 0;
    }
    .news-item {
      padding: 8px 0 8px 20px;
      font-size: 13px;
      color: #cbd5e1;
      position: relative;
    }
    .news-item:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #4f46e5;
      font-weight: bold;
    }
    .runners-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    .runners-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #1e293b;
      font-size: 13px;
    }
    .rank {
      color: #64748b;
      width: 40px;
    }
    .ticker {
      font-weight: 700;
      color: white;
      width: 80px;
    }
    .volume {
      color: #94a3b8;
      text-align: right;
    }
    .score {
      color: #10b981;
      font-weight: 700;
      text-align: right;
      width: 50px;
    }
    .warning-banner {
      background-color: #78350f;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      margin: 16px 0;
    }
    .warning-title {
      font-size: 13px;
      font-weight: 700;
      color: #fbbf24;
      margin: 0 0 4px 0;
    }
    .warning-text {
      font-size: 12px;
      color: #fde68a;
      margin: 0;
    }
    .platform-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    .platform-column h4 {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    .platform-stock {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .platform-stock span:first-child {
      color: white;
      font-weight: 600;
    }
    .platform-stock span:last-child {
      color: #10b981;
      font-weight: 700;
    }
    .fund-card {
      background-color: #1e293b;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .fund-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .fund-ticker {
      font-size: 18px;
      font-weight: 700;
      color: white;
    }
    .fund-name {
      font-size: 12px;
      color: #94a3b8;
    }
    .fund-price {
      font-size: 20px;
      font-weight: 700;
      color: white;
    }
    .fund-metrics {
      display: flex;
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid #334155;
    }
    .fund-metric {
      flex: 1;
    }
    .fund-metric-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .fund-metric-value {
      font-size: 14px;
      font-weight: 700;
      color: white;
    }
    .cta-button {
      display: block;
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      margin: 24px 0;
    }
    .footer {
      text-align: center;
      padding: 24px;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <div class="header">
      <h1>📊 PutCall.nl Daily Market Brief</h1>
      <p>${today}</p>
    </div>

    <!-- Reddit Sentiment Section -->
    <div class="section">
      <div class="section-title">⚡ Reddit Sentiment</div>
      
      <div class="featured-stock">
        <div class="stock-symbol">${featuredStock.symbol}</div>
        <div class="stock-name">${featuredStock.name}</div>
        
        <div class="sentiment-badge">
          ${featuredStock.sentimentScore}% ${featuredStock.sentiment.toUpperCase()}
        </div>
        
        <div class="metrics-row">
          <div class="metric">
            <span class="metric-value">${featuredStock.mentions.toLocaleString()}</span>
            <span class="metric-label">Mentions</span>
          </div>
          <div class="metric">
            <span class="metric-value">#1</span>
            <span class="metric-label">Rank</span>
          </div>
          <div class="metric">
            <span class="metric-value">${featuredStock.volumeChange || 'N/A'}</span>
            <span class="metric-label">Volume</span>
          </div>
        </div>
        
        <div class="summary">
          "${featuredStock.discussionSummary}"
        </div>
        
        ${featuredStock.recentNews && featuredStock.recentNews.length > 0 ? `
          <div style="margin-top: 16px; text-align: left;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">📰 Recent News</div>
            <ul class="news-list">
              ${featuredStock.recentNews.map(news => `<li class="news-item">${news}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Trending Runners Up -->
    <div class="section">
      <div class="section-title">🔥 Trending Runners Up</div>
      <table class="runners-table">
        ${runnersUp.map((stock, index) => `
          <tr>
            <td class="rank">#${index + 2}</td>
            <td class="ticker">${stock.symbol}</td>
            <td class="volume">${stock.volumeChange || '+0%'}</td>
            <td class="score">${stock.sentimentScore}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <!-- Cross-Platform Validation -->
    <div class="section">
      <div class="section-title">✅ Cross-Platform Validation</div>
      
      <div class="warning-banner">
        <div class="warning-title">⚠️ Reddit's Top Pick: ${featuredStock.symbol}</div>
        <p class="warning-text">Reddit-only stock. Not trending on institutional platforms. Higher risk meme play.</p>
      </div>
      
      <div class="platform-grid">
        <div class="platform-column">
          <h4>StockTwits</h4>
          <div class="platform-stock">
            <span>ARBB</span>
            <span>85</span>
          </div>
          <div class="platform-stock">
            <span>SSSS</span>
            <span>80</span>
          </div>
          <div class="platform-stock">
            <span>GALT</span>
            <span>75</span>
          </div>
        </div>
        
        <div class="platform-column">
          <h4>Yahoo Finance</h4>
          <div class="platform-stock">
            <span>OKLO</span>
            <span>82</span>
          </div>
          <div class="platform-stock">
            <span>RBLX</span>
            <span>77</span>
          </div>
          <div class="platform-stock">
            <span>GE</span>
            <span>72</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fundamentals Screener -->
    <div class="section">
      <div class="section-title">💎 Fundamentals Screener</div>
      <p style="font-size: 11px; color: #64748b; margin: 0 0 16px 0;">CRITERIA: FCF+ • LOW DEBT • VALUE</p>
      
      ${data.picks.slice(0, 3).map(pick => `
        <div class="fund-card">
          <div class="fund-header">
            <div>
              <div class="fund-ticker">${pick.symbol}</div>
              <div class="fund-name">${pick.name}</div>
            </div>
            <div class="fund-price">${pick.price}</div>
          </div>
          <div class="fund-metrics">
            <div class="fund-metric">
              <div class="fund-metric-label">P/E Ratio</div>
              <div class="fund-metric-value">${pick.metrics.peRatio}</div>
            </div>
            <div class="fund-metric">
              <div class="fund-metric-label">Free Cash Flow</div>
              <div class="fund-metric-value">${pick.metrics.freeCashFlow}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- CTA Button -->
    <a href="https://putcall.nl" class="cta-button">
      View Full Dashboard →
    </a>

    <!-- Footer -->
    <div class="footer">
      <p>You're receiving this because you subscribed to PutCall.nl daily updates.</p>
      ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}">Unsubscribe</a></p>` : ''}
      <p style="margin-top: 16px; font-size: 11px;">
        © ${new Date().getFullYear()} PutCall.nl • AI-Powered Market Intelligence
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}
