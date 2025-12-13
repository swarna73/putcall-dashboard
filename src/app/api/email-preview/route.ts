import { NextResponse } from 'next/server';
import { generateEmailHTML } from '@/utils/email-template';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get the host from the request headers
    const host = request.headers.get('host') || 'putcall.nl';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    console.log('Fetching dashboard data from:', `${baseUrl}/api/dashboard`);
    
    let dashboardData;
    
    try {
      // Try to fetch current dashboard data with a 5-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/api/dashboard`, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        dashboardData = await response.json();
        console.log('✅ Got live dashboard data');
      } else {
        throw new Error(`API returned ${response.status}`);
      }
      
    } catch (fetchError: any) {
      console.warn('⚠️ Dashboard API slow/failed, using cached data:', fetchError.message);
      
      // Use cached data from the main page (it has cache)
      // Or use sample/mock data for preview purposes
      try {
        const cachedResponse = await fetch(`${baseUrl}/api/dashboard`, {
          headers: {
            'Accept': 'application/json',
          },
          // This will use Vercel's edge cache if available
          next: { revalidate: 3600 }
        });
        
        if (cachedResponse.ok) {
          dashboardData = await cachedResponse.json();
          console.log('✅ Got cached dashboard data');
        } else {
          throw new Error('Cache also failed');
        }
      } catch {
        // If everything fails, use sample data for preview
        console.log('ℹ️ Using sample data for preview');
        dashboardData = getSampleDashboardData();
      }
    }
    
    // Validate we have the required data
    if (!dashboardData.redditTrends || dashboardData.redditTrends.length === 0) {
      console.warn('No Reddit trends, using sample data');
      dashboardData = getSampleDashboardData();
    }
    
    // Generate email HTML
    const emailHTML = generateEmailHTML({
      data: dashboardData,
      unsubscribeUrl: `${baseUrl}/unsubscribe?token=PREVIEW_TOKEN`
    });
    
    // Return HTML for preview
    return new NextResponse(emailHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // Cache preview for 5 minutes
      },
    });
    
  } catch (error: any) {
    console.error('Email preview error:', error);
    
    // Return a helpful error page
    const errorHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Preview Error</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #0f172a;
      color: white;
    }
    .error-box {
      background: #7f1d1d;
      border: 2px solid #dc2626;
      border-radius: 8px;
      padding: 20px;
    }
    h1 { margin: 0 0 10px 0; color: #fca5a5; }
    pre {
      background: #1e293b;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
    .help {
      margin-top: 20px;
      padding: 15px;
      background: #1e293b;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="error-box">
    <h1>❌ Email Preview Error</h1>
    <p>Failed to generate email preview</p>
    <pre>${error.message || 'Unknown error'}</pre>
  </div>
  
  <div class="help">
    <h3>💡 Troubleshooting:</h3>
    <ul>
      <li>Visit <a href="/" style="color: #60a5fa;">putcall.nl</a> to load the dashboard first</li>
      <li>Wait a few seconds, then try this preview again</li>
      <li>The dashboard caches data for 1 hour, so it should load faster</li>
    </ul>
  </div>
</body>
</html>
    `;
    
    return new NextResponse(errorHTML, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}

// Sample data for when API is unavailable
function getSampleDashboardData() {
  return {
    marketIndices: [
      { name: "S&P 500", value: "6,050", change: "+0.8%", trend: "Up" },
      { name: "Dow Jones", value: "44,200", change: "+0.5%", trend: "Up" },
      { name: "Nasdaq", value: "19,800", change: "+1.2%", trend: "Up" },
    ],
    marketSentiment: {
      score: 75,
      label: "Greed",
      primaryDriver: "Sample market data for preview"
    },
    sectorRotation: [
      { name: "Technology", performance: "Bullish", change: "+1.5%" },
      { name: "Healthcare", performance: "Neutral", change: "+0.3%" },
    ],
    redditTrends: [
      {
        symbol: "GME",
        name: "GameStop",
        mentions: 7500,
        sentiment: "Bullish",
        sentimentScore: 88,
        discussionSummary: "Renewed interest in short squeeze potential and upcoming earnings driving significant discussion.",
        volumeChange: "+45% vs Avg",
        keywords: ["SQUEEZE", "MOON", "EARNINGS", "APES", "DIAMONDHANDS"],
        recentNews: [
          "GameStop reports Q4 earnings beat expectations",
          "Short interest increases to 20% of float",
          "Ryan Cohen increases stake by 2M shares"
        ]
      },
      {
        symbol: "AMC",
        name: "AMC Entertainment",
        mentions: 5200,
        sentiment: "Bullish",
        sentimentScore: 82,
        discussionSummary: "Box office recovery and debt reduction driving optimism",
        volumeChange: "+38% vs Avg",
        keywords: ["MOVIES", "RECOVERY", "APES"],
        recentNews: []
      },
      {
        symbol: "TSLA",
        name: "Tesla",
        mentions: 4800,
        sentiment: "Neutral",
        sentimentScore: 70,
        discussionSummary: "Mixed sentiment on delivery numbers and valuation concerns",
        volumeChange: "+18% vs Avg",
        keywords: ["EV", "MUSK", "DELIVERIES"],
        recentNews: []
      },
      {
        symbol: "NVDA",
        name: "NVIDIA",
        mentions: 4200,
        sentiment: "Bullish",
        sentimentScore: 92,
        discussionSummary: "AI chip demand remains strong",
        volumeChange: "+28% vs Avg",
        keywords: ["AI", "CHIPS", "DATACENTER"],
        recentNews: []
      },
      {
        symbol: "PLTR",
        name: "Palantir",
        mentions: 3800,
        sentiment: "Bullish",
        sentimentScore: 85,
        discussionSummary: "Government contracts driving growth",
        volumeChange: "+30% vs Avg",
        keywords: ["AI", "GOVERNMENT", "DATA"],
        recentNews: []
      },
      {
        symbol: "AMD",
        name: "AMD",
        mentions: 3200,
        sentiment: "Bullish",
        sentimentScore: 80,
        discussionSummary: "Strong competition in AI chip market",
        volumeChange: "+22% vs Avg",
        keywords: ["CHIPS", "AI", "DATACENTER"],
        recentNews: []
      },
      {
        symbol: "AAPL",
        name: "Apple",
        mentions: 2800,
        sentiment: "Neutral",
        sentimentScore: 68,
        discussionSummary: "iPhone sales steady, services growing",
        volumeChange: "+10% vs Avg",
        keywords: ["IPHONE", "SERVICES", "DIVIDEND"],
        recentNews: []
      },
      {
        symbol: "MSFT",
        name: "Microsoft",
        mentions: 2400,
        sentiment: "Bullish",
        sentimentScore: 87,
        discussionSummary: "Azure cloud growth accelerating",
        volumeChange: "+15% vs Avg",
        keywords: ["AI", "AZURE", "CLOUD"],
        recentNews: []
      },
      {
        symbol: "META",
        name: "Meta Platforms",
        mentions: 2000,
        sentiment: "Bullish",
        sentimentScore: 83,
        discussionSummary: "Ad revenue recovery and AI investments",
        volumeChange: "+17% vs Avg",
        keywords: ["AI", "METAVERSE", "ADS"],
        recentNews: []
      },
      {
        symbol: "GOOGL",
        name: "Alphabet",
        mentions: 1800,
        sentiment: "Neutral",
        sentimentScore: 72,
        discussionSummary: "Search dominance continues, AI competition",
        volumeChange: "+12% vs Avg",
        keywords: ["SEARCH", "AI", "CLOUD"],
        recentNews: []
      }
    ],
    news: [
      {
        title: "Fed holds rates steady, signals potential cuts in 2025",
        source: "Bloomberg",
        url: "#",
        timestamp: "2h ago",
        summary: "Federal Reserve maintains current interest rate policy",
        impact: "Critical"
      }
    ],
    picks: [
      {
        symbol: "VZ",
        name: "Verizon Communications Inc.",
        price: "$40.87",
        sector: "Telecommunications",
        metrics: {
          peRatio: "8.57",
          roe: "15%",
          debtToEquity: "1.8",
          freeCashFlow: "$10B",
          marketCap: "$177B",
          dividendYield: "6.5%"
        },
        analysis: "Strong dividend yield with stable cash flow generation",
        conviction: "Strong Buy"
      },
      {
        symbol: "PFE",
        name: "Pfizer",
        price: "$25.85",
        sector: "Pharmaceuticals",
        metrics: {
          peRatio: "14.8",
          roe: "12%",
          debtToEquity: "0.5",
          freeCashFlow: "$10.38B",
          marketCap: "$145B",
          dividendYield: "5.8%"
        },
        analysis: "Attractive valuation with strong pipeline",
        conviction: "Buy"
      },
      {
        symbol: "CVX",
        name: "Chevron",
        price: "$150.24",
        sector: "Energy",
        metrics: {
          peRatio: "20.92",
          roe: "18%",
          debtToEquity: "0.3",
          freeCashFlow: "$17.66B",
          marketCap: "$280B",
          dividendYield: "3.5%"
        },
        analysis: "Well-positioned for energy transition with strong balance sheet",
        conviction: "Buy"
      }
    ],
    insiderTrades: [],
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
