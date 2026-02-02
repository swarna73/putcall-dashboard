// utils/email-template.ts
// Compact newsletter layout with parallel columns
// UPDATED: Includes earnings calendar for this week

interface EmailTemplateProps {
  data: {
    marketSentiment?: { score: number; label: string; primaryDriver?: string };
    marketIndices?: Array<{ name: string; value: string; change: string; trend: string }>;
    redditTrends?: Array<{
      symbol: string;
      name: string;
      mentions: number;
      sentiment: string;
      sentimentScore: number;
      discussionSummary?: string;
      volumeChange?: string;
    }>;
    news?: Array<{ title: string; source: string; url?: string; timestamp?: string; impact?: string }>;
    picks?: Array<{
      symbol: string;
      name: string;
      price: string;
      sector?: string;
      metrics?: { peRatio?: string; dividendYield?: string; freeCashFlow?: string; marketCap?: string };
      analysis?: string;
      conviction?: string;
    }>;
  };
  earnings?: Array<{
    symbol: string;
    companyName: string;
    date: string;
    time: 'bmo' | 'amc' | 'dmh' | null;
    epsEstimate?: number;
    epsActual?: number;
    hasReported: boolean;
    priceChange?: number;
  }>;
  unsubscribeUrl?: string;
  stocktwits?: Array<{ symbol: string; name: string; sentiment: number }>;
  yahoo?: Array<{ symbol: string; name: string; sentiment: number }>;
  redditAvailable?: boolean;
  redditSource?: 'tradestie' | 'reddit' | 'cache' | 'unavailable';
}

export function generateEmailHTML({
  data,
  earnings = [],
  unsubscribeUrl,
  stocktwits = [],
  yahoo = [],
  redditAvailable,
  redditSource = 'unavailable'
}: EmailTemplateProps): string {
  const sentiment = data.marketSentiment || { score: 50, label: 'Neutral' };
  const indices = data.marketIndices || [];
  const trends = data.redditTrends || [];
  const picks = data.picks || [];

  const hasRedditData = redditAvailable !== undefined
    ? redditAvailable
    : (trends.length > 0);

  const topStock = hasRedditData ? trends[0] : null;

  const getSentimentColor = (score: number) => {
    if (score >= 60) return '#10b981';
    if (score <= 40) return '#ef4444';
    return '#f59e0b';
  };

  const sentimentColor = getSentimentColor(sentiment.score);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Format earnings date
  const formatEarningsDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string | null) => {
    switch (time) {
      case 'bmo': return 'Before Open';
      case 'amc': return 'After Close';
      case 'dmh': return 'During Hours';
      default: return 'TBA';
    }
  };

  // Generate earnings HTML
  const earningsHTML = earnings.slice(0, 8).map(earning => {
    const dateLabel = formatEarningsDate(earning.date);

    // Determine if earnings beat/miss/met expectations
    let resultColor = '#f59e0b'; // Default yellow for upcoming
    let resultText = 'Upcoming';

    if (earning.hasReported && earning.epsActual !== null && earning.epsEstimate !== null) {
      const diff = earning.epsActual - earning.epsEstimate;
      if (Math.abs(diff) < 0.01) {
        resultColor = '#3b82f6'; // Blue for met
        resultText = 'Met';
      } else if (diff > 0) {
        resultColor = '#10b981'; // Green for beat
        resultText = 'Beat';
      } else {
        resultColor = '#ef4444'; // Red for miss
        resultText = 'Miss';
      }
    }

    // Format EPS values - handle null gracefully
    const formatEPS = (value: number | null | undefined) => {
      if (value === null || value === undefined) return '--';
      return `$${value.toFixed(2)}`;
    };

    return `<tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 10px 12px;">
        <div style="font-weight: 600; color: #ffffff; font-size: 14px; margin-bottom: 2px;">${earning.symbol}</div>
        <div style="font-size: 10px; color: #64748b;">${earning.companyName || earning.symbol}</div>
      </td>
      <td style="padding: 10px 12px; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">${dateLabel}</div>
        <div style="font-size: 10px; color: #64748b;">${formatTime(earning.time)}</div>
      </td>
      <td style="padding: 10px 12px; text-align: right;">
        ${earning.hasReported ? `
          <div style="background: ${resultColor}22; color: ${resultColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 4px;">
            ${formatEPS(earning.epsActual)}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            Est: ${formatEPS(earning.epsEstimate)}
          </div>
          ${earning.priceChange !== undefined && earning.priceChange !== null ? `
            <div style="font-size: 11px; color: ${earning.priceChange >= 0 ? '#10b981' : '#ef4444'}; margin-top: 4px; font-weight: 600;">
              ${earning.priceChange >= 0 ? '▲' : '▼'} ${Math.abs(earning.priceChange).toFixed(1)}%
            </div>
          ` : ''}
        ` : `
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
            ${formatEPS(earning.epsEstimate)}
          </div>
          <div style="background: ${resultColor}22; color: ${resultColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block;">
            ${resultText}
          </div>
        `}
      </td>
    </tr>`;
  }).join('');

  // Generate indices bar
  const indicesHTML = indices.slice(0, 3).map(idx => {
    const color = idx.change.startsWith('+') ? '#10b981' : '#ef4444';
    return `<td style="padding: 0 12px; text-align: center;">
      <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">${idx.name.replace('Dow Jones Industrial Average', 'DOW')}</div>
      <div style="font-size: 14px; font-weight: 600; color: #ffffff;">${idx.value}</div>
      <div style="font-size: 12px; color: ${color};">${idx.change}</div>
    </td>`;
  }).join('');

  // Generate compact stock row
  const generateStockRow = (symbol: string, name: string, score: number, index: number) => {
    const color = score >= 60 ? '#10b981' : score <= 40 ? '#ef4444' : '#f59e0b';
    return `<tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 6px 8px; color: #64748b; font-size: 11px;">${index + 1}</td>
      <td style="padding: 6px 8px;">
        <span style="font-weight: 600; color: #ffffff; font-size: 13px;">${symbol}</span>
      </td>
      <td style="padding: 6px 8px; text-align: right;">
        <span style="background: ${color}22; color: ${color}; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">${score}</span>
      </td>
    </tr>`;
  };

  const redditRows = hasRedditData
    ? trends.slice(0, 10).map((stock, i) =>
        generateStockRow(stock.symbol, stock.name, stock.sentimentScore, i)
      ).join('')
    : '';

  const stocktwitsRows = stocktwits.slice(0, 10).map((stock, i) =>
    generateStockRow(stock.symbol, stock.name, stock.sentiment, i)
  ).join('');

  const yahooRows = yahoo.slice(0, 10).map((stock, i) =>
    generateStockRow(stock.symbol, stock.name, stock.sentiment, i)
  ).join('');

  // Split picks into rows of 3
  const picksRow1 = picks.slice(0, 3).map(pick => {
    const convictionColor = pick.conviction === 'Strong Buy' ? '#10b981' :
                           pick.conviction === 'Buy' ? '#3b82f6' : '#f59e0b';
    return `<td style="padding: 6px; vertical-align: top; width: 33.33%;">
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
        <div style="margin-bottom: 6px;">
          <span style="font-weight: 700; color: #ffffff; font-size: 15px;">${pick.symbol}</span>
          <span style="background: ${convictionColor}22; color: ${convictionColor}; padding: 2px 5px; border-radius: 4px; font-size: 9px; font-weight: 600; margin-left: 6px;">${pick.conviction || 'HOLD'}</span>
        </div>
        <div style="color: #6366f1; font-weight: 600; font-size: 13px; margin-bottom: 4px;">${pick.price}</div>
        <div style="font-size: 10px; color: #94a3b8;">P/E ${pick.metrics?.peRatio || 'N/A'} • Div ${pick.metrics?.dividendYield || 'N/A'}</div>
      </div>
    </td>`;
  }).join('');

  const picksRow2 = picks.slice(3, 6).map(pick => {
    const convictionColor = pick.conviction === 'Strong Buy' ? '#10b981' :
                           pick.conviction === 'Buy' ? '#3b82f6' : '#f59e0b';
    return `<td style="padding: 6px; vertical-align: top; width: 33.33%;">
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
        <div style="margin-bottom: 6px;">
          <span style="font-weight: 700; color: #ffffff; font-size: 15px;">${pick.symbol}</span>
          <span style="background: ${convictionColor}22; color: ${convictionColor}; padding: 2px 5px; border-radius: 4px; font-size: 9px; font-weight: 600; margin-left: 6px;">${pick.conviction || 'HOLD'}</span>
        </div>
        <div style="color: #6366f1; font-weight: 600; font-size: 13px; margin-bottom: 4px;">${pick.price}</div>
        <div style="font-size: 10px; color: #94a3b8;">P/E ${pick.metrics?.peRatio || 'N/A'} • Div ${pick.metrics?.dividendYield || 'N/A'}</div>
      </div>
    </td>`;
  }).join('');

  const topStockSection = topStock ? `
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 10px; padding: 16px;">
      <div style="font-size: 11px; color: #f59e0b; text-transform: uppercase; margin-bottom: 6px;">🔥 Reddit #1 Trending</div>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="font-size: 28px; font-weight: 700; color: #ffffff;">${topStock.symbol}</span>
          <span style="font-size: 13px; color: #94a3b8; margin-left: 8px;">${topStock.name}</span>
        </div>
        <div style="text-align: right;">
          <div style="background: ${getSentimentColor(topStock.sentimentScore)}22; color: ${getSentimentColor(topStock.sentimentScore)}; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600;">${topStock.sentimentScore}% ${topStock.sentiment}</div>
        </div>
      </div>
      <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
        <span style="color: #10b981;">${topStock.volumeChange || '+20%'}</span> volume • ${topStock.mentions?.toLocaleString() || '5,000'} mentions
      </div>
    </div>
  ` : `
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 10px; padding: 16px;">
      ${stocktwits.length > 0 ? `
        <div style="font-size: 11px; color: #3b82f6; text-transform: uppercase; margin-bottom: 6px;">💬 StockTwits #1 Trending</div>
        <div style="display: flex; align-items: center; justify-between;">
          <div>
            <span style="font-size: 28px; font-weight: 700; color: #ffffff;">${stocktwits[0].symbol}</span>
            <span style="font-size: 13px; color: #94a3b8; margin-left: 8px;">${stocktwits[0].name}</span>
          </div>
          <div style="text-align: right;">
            <div style="background: ${getSentimentColor(stocktwits[0].sentiment)}22; color: ${getSentimentColor(stocktwits[0].sentiment)}; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600;">${stocktwits[0].sentiment} Score</div>
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
          Top trending on StockTwits today
        </div>
      ` : `
        <div style="text-align: center; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">📡 Top Trending</div>
          <div style="font-size: 14px; color: #94a3b8;">Check the columns below for trending stocks</div>
        </div>
      `}
    </div>
  `;

  const redditColumnContent = hasRedditData ? `
    <div style="background: #ef4444; padding: 8px 12px;">
      <span style="color: #ffffff; font-weight: 600; font-size: 12px;">📈 Reddit WSB</span>
      ${redditSource === 'cache' ? '<span style="color: rgba(255,255,255,0.7); font-size: 10px; margin-left: 6px;">(cached)</span>' : ''}
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
      ${redditRows}
    </table>
  ` : `
    <div style="background: #64748b; padding: 8px 12px;">
      <span style="color: #ffffff; font-weight: 600; font-size: 12px;">📈 Reddit WSB</span>
    </div>
    <div style="padding: 20px 12px; text-align: center;">
      <div style="font-size: 20px; margin-bottom: 8px;">📡</div>
      <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Temporarily Unavailable</div>
      <div style="font-size: 10px; color: #64748b;">Check StockTwits & Yahoo →</div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PutCall.nl Daily Brief</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #020617;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 700px; background-color: #0b1221; border-radius: 12px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">📊 Daily Market Brief</h1>
              <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">${today}</p>
            </td>
          </tr>

          <!-- Market Indices Bar -->
          <tr>
            <td style="background: #0f172a; padding: 12px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>${indicesHTML}</tr>
              </table>
            </td>
          </tr>

          <!-- Sentiment + Top Stock (side by side) -->
          <tr>
            <td style="padding: 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Sentiment -->
                  <td style="width: 35%; vertical-align: top; padding-right: 10px;">
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; text-align: center;">
                      <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">Market Sentiment</div>
                      <div style="font-size: 42px; font-weight: 700; color: ${sentimentColor};">${sentiment.score}</div>
                      <div style="font-size: 14px; color: ${sentimentColor}; font-weight: 600;">${sentiment.label}</div>
                    </div>
                  </td>

                  <!-- Top Stock (or alternative) -->
                  <td style="width: 65%; vertical-align: top;">
                    ${topStockSection}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Earnings Calendar -->
          ${earnings.length > 0 ? `
          <tr>
            <td style="padding: 0 16px 20px 16px;">
              <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 12px; overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 14px 16px;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <span style="color: #ffffff; font-weight: 700; font-size: 15px;">📊 Earnings This Week</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px;">
                      <span style="color: #ffffff; font-size: 11px; font-weight: 600;">${earnings.length} Companies</span>
                    </div>
                  </div>
                </div>

                <!-- Table -->
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
                  <thead>
                    <tr style="background: #1e293b;">
                      <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Company</th>
                      <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">When</th>
                      <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Results</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${earningsHTML}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Three Column Tables: Reddit | StockTwits | Yahoo -->
          <tr>
            <td style="padding: 0 16px 16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Reddit Column -->
                  <td style="width: 33.33%; vertical-align: top; padding-right: 8px;">
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;">
                      ${redditColumnContent}
                    </div>
                  </td>

                  <!-- StockTwits Column -->
                  <td style="width: 33.33%; vertical-align: top; padding: 0 4px;">
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;">
                      <div style="background: #3b82f6; padding: 8px 12px;">
                        <span style="color: #ffffff; font-weight: 600; font-size: 12px;">💬 StockTwits</span>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
                        ${stocktwitsRows || '<tr><td style="padding: 12px; color: #64748b; text-align: center;">No data</td></tr>'}
                      </table>
                    </div>
                  </td>

                  <!-- Yahoo Column -->
                  <td style="width: 33.33%; vertical-align: top; padding-left: 8px;">
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;">
                      <div style="background: #7c3aed; padding: 8px 12px;">
                        <span style="color: #ffffff; font-weight: 600; font-size: 12px;">📊 Yahoo Finance</span>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
                        ${yahooRows || '<tr><td style="padding: 12px; color: #64748b; text-align: center;">No data</td></tr>'}
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Value Picks Section -->
          <tr>
            <td style="padding: 0 16px 16px 16px;">
              <div style="margin-bottom: 12px;">
                <span style="color: #ffffff; font-weight: 600; font-size: 14px;">💎 Value Stock Picks</span>
                <span style="color: #64748b; font-size: 11px; margin-left: 8px;">P/E &lt;15 • Low Debt • Undervalued</span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>${picksRow1}</tr>
                ${picksRow2 ? `<tr>${picksRow2}</tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 16px; text-align: center;">
              <a href="https://putcall.nl" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Full Dashboard →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">
                You're receiving this because you subscribed to PutCall.nl
              </p>
              ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color: #6366f1; font-size: 11px; text-decoration: none;">Unsubscribe</a>` : ''}
              <p style="margin: 12px 0 0 0; color: #475569; font-size: 10px;">
                © ${new Date().getFullYear()} PutCall.nl • Data for informational purposes only
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

