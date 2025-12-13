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
    
    // Fetch current dashboard data
    const response = await fetch(`${baseUrl}/api/dashboard`, {
      headers: {
        'Accept': 'application/json',
      },
      // Don't use cache for preview
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dashboard API error:', response.status, errorText);
      throw new Error(`Dashboard API returned ${response.status}: ${errorText}`);
    }
    
    const dashboardData = await response.json();
    
    // Validate we have the required data
    if (!dashboardData.redditTrends || dashboardData.redditTrends.length === 0) {
      throw new Error('No Reddit trends data available');
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
        'Cache-Control': 'no-store, no-cache, must-revalidate',
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
      <li>Check if <code>/api/dashboard</code> is working</li>
      <li>Check browser console for errors</li>
      <li>Ensure dashboard has data loaded</li>
      <li>Try visiting <a href="/api/dashboard" style="color: #60a5fa;">/api/dashboard</a> directly</li>
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
