import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://putcall.nl';

    const response = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { 'User-Agent': 'Vercel-Cron-Bot' },
    });

    if (!response.ok) throw new Error(`Dashboard returned ${response.status}`);
    const data = await response.json();

    return NextResponse.json({
      success: true,
      valuePicks: data.valuePicks?.picks?.length || 0,
      fromCache: data.fromCache
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
