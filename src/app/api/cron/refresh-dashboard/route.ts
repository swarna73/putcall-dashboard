import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('❌ Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔄 Cron: Pre-warming dashboard cache...');
    const startTime = Date.now();
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'https://putcall.nl';
    
    const response = await fetch(`${baseUrl}/api/dashboard`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron-Bot',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard API returned ${response.status}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    
    console.log(`✅ Cron: Cache refreshed in ${endTime - startTime}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Dashboard cache refreshed',
      timestamp: new Date().toISOString(),
      fromCache: data.fromCache,
      duration: `${endTime - startTime}ms`,
    });
  } catch (error: any) {
    console.error('❌ Cron failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
