// API Route: /api/reddit-insider-alerts
// Fetches and parses insider alerts from r/InsiderData subreddit

import { NextRequest, NextResponse } from 'next/server';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  created_utc: number;
  url: string;
  permalink: string;
  author: string;
  score: number;
}

export interface ParsedInsiderAlert {
  redditId: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  amount: string | null;
  shares: number | null;
  pricePerShare: number | null;
  tradeDate: string | null;
  filingDate: string | null;
  insiderName: string | null;
  companyName: string | null;
  redditUrl: string;
  redditScore: number;
  postedAt: string;
  rawText: string;
}

function parseInsiderAlert(post: RedditPost): ParsedInsiderAlert | null {
  const text = `${post.title} ${post.selftext}`;
  
  // Must contain insider alert indicators
  if (!text.toLowerCase().includes('insider') && 
      !text.toLowerCase().includes('form 4') &&
      !text.toLowerCase().includes('sec filing')) {
    return null;
  }

  // Extract ticker (looks for $TICKER pattern)
  const tickerMatch = text.match(/\$([A-Z]{1,5})\b/i);
  if (!tickerMatch) return null;
  
  const ticker = tickerMatch[1].toUpperCase();

  // Determine buy or sell
  const isBuy = text.toLowerCase().includes('buy') || 
                text.toLowerCase().includes('purchased') ||
                text.toLowerCase().includes('acquired');
  const isSell = text.toLowerCase().includes('sell') || 
                 text.toLowerCase().includes('sold') ||
                 text.toLowerCase().includes('disposed');
  
  if (!isBuy && !isSell) return null;

  // Extract amount (looks for $X.XM, $X.XB, or large numbers)
  const amountMatch = text.match(/\$(\d+\.?\d*)\s*([MBK])/i) || 
                      text.match(/total of \$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i);
  const amount = amountMatch ? amountMatch[0] : null;

  // Extract shares
  const sharesMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s*shares/i);
  const shares = sharesMatch ? parseInt(sharesMatch[1].replace(/,/g, '')) : null;

  // Extract price per share
  const priceMatch = text.match(/\$(\d+\.?\d*)\s*per share/i);
  const pricePerShare = priceMatch ? parseFloat(priceMatch[1]) : null;

  // Extract trade date (YYYY-MM-DD format)
  const tradeDateMatch = text.match(/Trade Date[:\s]*(\d{4}-\d{2}-\d{2})/i);
  const tradeDate = tradeDateMatch ? tradeDateMatch[1] : null;

  // Extract filing date
  const filingDateMatch = text.match(/Filing Date[:\s]*(\d{4}-\d{2}-\d{2})/i);
  const filingDate = filingDateMatch ? filingDateMatch[1] : null;

  // Extract insider name (various patterns)
  const insiderPatterns = [
    /(?:by|from)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/,
    /([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:CEO|CFO|Director|Officer)/i,
    /([A-Z][a-z]+,?\s+[A-Z][a-z]+)\s+of\s+/,
  ];
  
  let insiderName: string | null = null;
  for (const pattern of insiderPatterns) {
    const match = text.match(pattern);
    if (match) {
      insiderName = match[1].trim();
      break;
    }
  }

  // Extract company name
  const companyMatch = text.match(/of\s+([A-Z][A-Za-z\s&.]+(?:Inc|Corp|Ltd|plc|LLC)?)/);
  const companyName = companyMatch ? companyMatch[1].trim() : null;

  return {
    redditId: post.id,
    ticker,
    type: isBuy ? 'BUY' : 'SELL',
    amount,
    shares,
    pricePerShare,
    tradeDate,
    filingDate,
    insiderName,
    companyName,
    redditUrl: `https://reddit.com${post.permalink}`,
    redditScore: post.score,
    postedAt: new Date(post.created_utc * 1000).toISOString(),
    rawText: text.slice(0, 500),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '25';
  const after = searchParams.get('after');

  try {
    // Fetch from r/InsiderData
    let redditUrl = `https://www.reddit.com/r/InsiderData/new.json?limit=${limit}`;
    if (after) {
      redditUrl += `&after=${after}`;
    }

    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'PutCall.nl:insider-monitor:v1.0 (by /u/putcall_nl)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`);
    }

    const data = await response.json();
    const posts: RedditPost[] = data.data.children.map((child: any) => child.data);

    // Parse each post for insider alerts
    const alerts: ParsedInsiderAlert[] = [];
    
    for (const post of posts) {
      const parsed = parseInsiderAlert(post);
      if (parsed) {
        alerts.push(parsed);
      }
    }

    return NextResponse.json({
      alerts,
      count: alerts.length,
      totalPosts: posts.length,
      after: data.data.after,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Reddit fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch from Reddit',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
