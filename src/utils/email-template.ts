import { DashboardData, RedditTicker } from '../types';

interface EmailTemplateProps {
  data: DashboardData;
  unsubscribeUrl?: string;
  stocktwits?: Array<{ symbol: string; name: string; sentimentScore: number }>;
  yahoo?: Array<{ symbol: string; change: string; sentimentScore: number }>;
}

export function generateEmailHTML({ data, unsubscribeUrl, stocktwits, yahoo }: EmailTemplateProps): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const featuredStock = data.redditTrends[0];
  const runnersUp = data.redditTrends.slice(1, 10);
  const allPicks = data.picks.slice(0, 6); // Show up to 6 value picks

  // Get sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 70) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // Get conviction color
  const getConvictionColor = (conviction: string) => {
    if (conviction === 'Strong Buy') return '#10b981';
    if (conviction === 'Buy') return '#22c55e';
    return '#94a3b8';
  };

  // Check if featured stock is on other platforms
  const isOnStockTwits = stocktwits?.some(s => s.symbol === featuredStock?.symbol);
  const isOnYahoo = yahoo?.some(s => s.symbol === featuredStock?.symbol);
  const platformCount = (isOnStockTwits ? 1 : 0) + (isOnYahoo ? 1 : 0);

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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #020617;
      color: #ffffff;
      line-height: 1.5;
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
      font-size: 26px;
      font-weight: 800;
      color: white;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
    }
    .market-bar {
      background-color: #1e293b;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    .market-item {
      text-align: center;
    }
    .market-label {
      color: #64748b;
      margin-bottom: 2px;
    }
    .market-value {
      color: #ffffff;
      font-weight: 600;
    }
    .market-change {
      font-weight: 700;
    }
    .market-up { color: #10b981; }
    .market-down { color: #ef4444; }
    .section {
      margin: 20px;
      padding: 20px;
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 0 0 16px 0;
    }
    .featured-stock {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .stock-symbol {
      font-size: 52px;
      font-weight: 900;
      color: white;
      margin: 0;
      letter-spacing: -2px;
    }
    .stock-name {
      font-size: 14px;
      color: #94a3b8;
      margin: 4px 0 16px 0;
    }
    .sentiment-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .metrics-grid {
      display: flex;
      justify-content: center;
      gap: 32px;
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
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-box {
      background-color: #1e293b;
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.6;
      margin-top: 16px;
      border-left: 3px solid #4f46e5;
    }
    .runners-table {
      width: 100%;
      border-collapse: collapse;
    }
    .runners-table th {
      text-align: left;
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      padding: 8px 6px;
      border-bottom: 1px solid #334155;
    }
    .runners-table th:last-child {
      text-align: right;
    }
    .runners-table td {
      padding: 10px 6px;
      border-bottom: 1px solid #1e293b;
      font-size: 13px;
    }
    .rank {
      color: #64748b;
      font-weight: 600;
      width: 30px;
    }
    .ticker {
      font-weight: 700;
      color: white;
    }
    .ticker-name {
      font-size: 11px;
      color: #64748b;
      font-weight: 400;
    }
    .volume {
      color: #10b981;
      font-size: 12px;
    }
    .score {
      text-align: right;
      font-weight: 700;
    }
    .validation-banner {
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
    }
    .validation-title {
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .validation-text {
      font-size: 12px;
      margin: 0;
      line-height: 1.5;
    }
    .platform-grid {
      display: flex;
      gap: 12px;
    }
    .platform-column {
      flex: 1;
      background-color: #1e293b;
      border-radius: 8px;
      padding: 12px;
    }
    .platform-header {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #334155;
    }
    .platform-stock {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 12px;
    }
    .platform-symbol {
      color: white;
      font-weight: 600;
    }
    .platform-score {
      font-weight: 700;
    }
    .fund-card {
      background-color: #1e293b;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 10px;
    }
    .fund-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .fund-ticker-box {
      background-color: #0f172a;
      padding: 8px 12px;
      border-radius: 6px;
      margin-right: 12px;
    }
    .fund-ticker {
      font-size: 18px;
      font-weight: 800;
      color: white;
    }
    .fund-info {
      flex: 1;
    }
    .fund-name {
      font-size: 14px;
      color: white;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .fund-price {
      font-size: 16px;
      font-weight: 700;
      color: #10b981;
    }
    .conviction-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .fund-metrics {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .fund-metric {
      flex: 1;
      min-width: 70px;
      background-color: #0f172a;
      padding: 8px 10px;
      border-radius: 6px;
    }
    .fund-metric-label {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .fund-metric-value {
      font-size: 13px;
      font-weight: 700;
      color: white;
    }
    .fund-analysis {
      margin-top: 10px;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #334155;
      padding-top: 10px;
    }
    .cta-section {
      text-align: center;
      padding: 24px;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding: 24px;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
    .footer a {
      color: #818cf8;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #334155, transparent);
      margin: 0 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <div class="header">
      <h1>📊 Daily Market Brief</h1>
      <p>${today}</p>
    </div>

    <!-- Market Indices Bar -->
    ${data.marketIndices && data.marketIndices.length > 0 ? `
    <div class="market-bar">
      ${data.marketIndices.slice(0, 3).map(idx => `
        <div class="market-item">
          <div class="market-label">${idx.name === 'Dow Jones Industrial Average' ? 'DOW' : idx.name === 'Nasdaq Composite' ? 'NASDAQ' : 'S&P 500'}</div>
          <div class="market-value">${idx.value}</div>
          <div class="market-change ${idx.trend === 'Up' ? 'market-up' : 'market-down'}">${idx.change}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Market Sentiment -->
    ${data.marketSentiment ? `
    <div class="section" style="text-align: center; padding: 16px;">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">MARKET SENTIMENT</div>
      <div style="font-size: 48px; font-weight: 800; color: ${getSentimentColor(data.marketSentiment.score)};">${data.marketSentiment.score}</div>
      <div style="font-size: 16px; font-weight: 700; color: ${getSentimentColor(data.marketSentiment.score)};">${data.marketSentiment.label}</div>
    </div>
    ` : ''}

    <!-- Featured Stock (Reddit #1) -->
    ${featuredStock ? `
    <div class="section">
      <div class="section-title">🔥 Reddit's #1 Trending Stock</div>
      <div class="section-subtitle">Most discussed on r/wallstreetbets today</div>
      
      <div class="featured-stock">
        <div class="stock-symbol">${featuredStock.symbol}</div>
        <div class="stock-name">${featuredStock.name}</div>
        
        <div class="sentiment-badge" style="background-color: ${getSentimentColor(featuredStock.sentimentScore)}20; color: ${getSentimentColor(featuredStock.sentimentScore)}; border: 1px solid ${getSentimentColor(featuredStock.sentimentScore)}40;">
          ${featuredStock.sentimentScore}% ${featuredStock.sentiment}
        </div>
        
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-value">${featuredStock.mentions.toLocaleString()}</span>
            <span class="metric-label">Mentions</span>
          </div>
          <div class="metric">
            <span class="metric-value" style="color: #10b981;">${featuredStock.volumeChange || 'N/A'}</span>
            <span class="metric-label">vs Average</span>
          </div>
        </div>
        
        <div class="summary-box">
          💬 "${featuredStock.discussionSummary}"
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Trending Runners Up -->
    ${runnersUp.length > 0 ? `
    <div class="section">
      <div class="section-title">📈 Top 10 Trending Stocks</div>
      <div class="section-subtitle">Ranked by Reddit mentions and sentiment</div>
      
      <table class="runners-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Stock</th>
            <th>Volume</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${runnersUp.map((stock, index) => `
            <tr>
              <td class="rank">${index + 2}</td>
              <td>
                <span class="ticker">${stock.symbol}</span>
                <div class="ticker-name">${stock.name}</div>
              </td>
              <td class="volume">${stock.volumeChange || '+0%'}</td>
              <td class="score" style="color: ${getSentimentColor(stock.sentimentScore)};">${stock.sentimentScore}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="divider"></div>

    <!-- Cross-Platform Validation -->
    ${stocktwits || yahoo ? `
    <div class="section">
      <div class="section-title">✅ Cross-Platform Validation</div>
      <div class="section-subtitle">Compare Reddit trends with institutional platforms</div>
      
      <!-- Validation Banner -->
      <div class="validation-banner" style="background-color: ${platformCount === 0 ? '#78350f' : platformCount === 1 ? '#713f12' : '#064e3b'}; border: 1px solid ${platformCount === 0 ? '#f59e0b' : platformCount === 1 ? '#eab308' : '#10b981'};">
        <div class="validation-title" style="color: ${platformCount === 0 ? '#fbbf24' : platformCount === 1 ? '#facc15' : '#34d399'};">
          ${platformCount === 0 ? '⚠️' : platformCount === 1 ? '⚡' : '🎯'} Reddit's Top Pick: ${featuredStock?.symbol}
          ${isOnStockTwits ? ' ✓ StockTwits' : ''}${isOnYahoo ? ' ✓ Yahoo' : ''}
        </div>
        <p class="validation-text" style="color: ${platformCount === 0 ? '#fde68a' : platformCount === 1 ? '#fef08a' : '#a7f3d0'};">
          ${platformCount === 0 ? 'Reddit-only stock. Not trending on institutional platforms. Higher risk meme play.' : 
            platformCount === 1 ? 'Trending on 2 platforms. Gaining broader market attention.' :
            'Strong consensus! Trending across retail AND institutional platforms.'}
        </p>
      </div>
      
      <div class="platform-grid">
        ${stocktwits && stocktwits.length > 0 ? `
        <div class="platform-column">
          <div class="platform-header">📱 StockTwits</div>
          ${stocktwits.slice(0, 5).map(s => `
            <div class="platform-stock">
              <span class="platform-symbol">${s.symbol}</span>
              <span class="platform-score" style="color: ${getSentimentColor(s.sentimentScore)};">${s.sentimentScore}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${yahoo && yahoo.length > 0 ? `
        <div class="platform-column">
          <div class="platform-header">📊 Yahoo Finance</div>
          ${yahoo.slice(0, 5).map(s => `
            <div class="platform-stock">
              <span class="platform-symbol">${s.symbol}</span>
              <span class="platform-score" style="color: ${getSentimentColor(s.sentimentScore)};">${s.sentimentScore}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <div class="divider"></div>

    <!-- Fundamentals Screener -->
    ${allPicks.length > 0 ? `
    <div class="section">
      <div class="section-title">💎 Value Stock Picks</div>
      <div class="section-subtitle">FCF+ • LOW DEBT • UNDERVALUED</div>
      
      ${allPicks.map(pick => `
        <div class="fund-card">
          <div class="fund-header">
            <div style="display: flex; align-items: center;">
              <div class="fund-ticker-box">
                <div class="fund-ticker">${pick.symbol}</div>
              </div>
              <div class="fund-info">
                <div class="fund-name">${pick.name}</div>
                <div class="fund-price">${pick.price}</div>
              </div>
            </div>
            <div class="conviction-badge" style="background-color: ${getConvictionColor(pick.conviction)}20; color: ${getConvictionColor(pick.conviction)}; border: 1px solid ${getConvictionColor(pick.conviction)}40;">
              ${pick.conviction}
            </div>
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
            <div class="fund-metric">
              <div class="fund-metric-label">Dividend</div>
              <div class="fund-metric-value">${pick.metrics.dividendYield || 'N/A'}</div>
            </div>
          </div>
          
          <div class="fund-analysis">
            📝 ${pick.analysis}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- CTA -->
    <div class="cta-section">
      <a href="https://putcall.nl" class="cta-button" style="color: white !important;">
        View Full Dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>You're receiving this because you subscribed to PutCall.nl</p>
      ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}">Unsubscribe</a></p>` : ''}
      <p style="margin-top: 12px; font-size: 10px;">
        © ${new Date().getFullYear()} PutCall.nl • AI-Powered Market Intelligence
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}
