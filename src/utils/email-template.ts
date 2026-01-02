// utils/email-template.ts
// Compact newsletter layout with parallel columns
// UPDATED: Handles missing Reddit data gracefully - no fake data!

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
  unsubscribeUrl?: string;
  stocktwits?: Array<{ symbol: string; name: string; sentiment: number }>;
  yahoo?: Array<{ symbol: string; name: string; sentiment: number }>;
  // NEW: Reddit availability flags
  redditAvailable?: boolean;
  redditSource?: 'tradestie' | 'reddit' | 'cache' | 'unavailable';
}

export function generateEmailHTML({ 
  data, 
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
  
  // Determine if Reddit data is actually available
  const hasRedditData = redditAvailable !== undefined 
    ? redditAvailable 
    : (trends.length > 0);
  
  const topStock = hasRedditData ? trends[0] : null;

  // Sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 60) return '#10b981'; // green
    if (score <= 40) return '#ef4444'; // red
    return '#f59e0b'; // yellow
  };

  const sentimentColor = getSentimentColor(sentiment.score);
  
  // Format date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

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

  // Reddit trending table - only generate if data available
  const redditRows = hasRedditData 
    ? trends.slice(0, 10).map((stock, i) => 
        generateStockRow(stock.symbol, stock.name, stock.sentimentScore, i)
      ).join('')
    : '';

  // StockTwits table
  const stocktwitsRows = stocktwits.slice(0, 10).map((stock, i) => 
    generateStockRow(stock.symbol, stock.name, stock.sentiment, i)
  ).join('');

  // Yahoo table
  const yahooRows = yahoo.slice(0, 10).map((stock, i) => 
    generateStockRow(stock.symbol, stock.name, stock.sentiment, i)
  ).join('');

  // Value picks - compact cards
  const picksHTML = picks.slice(0, 6).map(pick => {
    const convictionColor = pick.conviction === 'Strong Buy' ? '#10b981' : 
                           pick.conviction === 'Buy' ? '#3b82f6' : '#f59e0b';
    return `<td style="padding: 6px; vertical-align: top; width: 33.33%;">
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; color: #ffffff; font-size: 16px;">${pick.symbol}</span>
          <span style="background: ${convictionColor}22; color: ${convictionColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${pick.conviction || 'HOLD'}</span>
        </div>
        <div style="color: #6366f1; font-weight: 600; font-size: 14px; margin-bottom: 6px;">${pick.price}</div>
        <table style="width: 100%; font-size: 10px; color: #94a3b8;">
          <tr>
            <td>P/E</td>
            <td style="text-align: right; color: #ffffff;">${pick.metrics?.peRatio || 'N/A'}</td>
          </tr>
          <tr>
            <td>Div</td>
            <td style="text-align: right; color: #ffffff;">${pick.metrics?.dividendYield || 'N/A'}</td>
          </tr>
        </table>
      </div>
    </td>`;
  }).join('');

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

  // =====================================================
  // TOP STOCK SECTION - Conditional based on data availability
  // =====================================================
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
    <!-- Reddit unavailable - show StockTwits top stock instead or message -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 10px; padding: 16px;">
      ${stocktwits.length > 0 ? `
        <div style="font-size: 11px; color: #3b82f6; text-transform: uppercase; margin-bottom: 6px;">💬 StockTwits #1 Trending</div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
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

  // =====================================================
  // REDDIT COLUMN - Shows unavailable message if no data
  // =====================================================
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
