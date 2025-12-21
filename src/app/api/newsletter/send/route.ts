// app/api/newsletter/send/route.ts
// Daily newsletter endpoint - called by GitHub Actions

import { NextResponse } from 'next/server';
import { getConfirmedSubscribers, updateLastEmailSent } from '@/utils/subscribers';
import { generateEmailHTML } from '@/utils/email-template';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for sending multiple emails

export async function GET(request: Request) {
  // Allow GET with secret param for easy testing
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret === process.env.CRON_SECRET) {
    return handleNewsletterSend();
  }
  
  return NextResponse.json({ error: 'Use POST with Authorization header' }, { status: 405 });
}

export async function POST(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  
  if (!expectedToken) {
    console.error('❌ CRON_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    console.error('❌ Unauthorized newsletter request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return handleNewsletterSend();
}

async function handleNewsletterSend() {
  console.log('📧 Daily newsletter triggered at', new Date().toISOString());
  
  try {
    // 1. Get confirmed subscribers from Supabase
    const subscribers = await getConfirmedSubscribers();
    
    console.log(`📋 Found ${subscribers.length} confirmed subscribers`);
    
    if (subscribers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No confirmed subscribers',
        sent: 0 
      });
    }

    // 2. Fetch fresh dashboard data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://putcall.nl';
    console.log('📊 Fetching dashboard data...');
    
    const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!dashboardResponse.ok) {
      throw new Error(`Dashboard API failed: ${dashboardResponse.status}`);
    }

    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard data fetched');

    // 3. Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    // 4. Prepare email subject
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const sentiment = dashboardData.marketSentiment;
    const sentimentEmoji = sentiment?.score >= 60 ? '📈' : sentiment?.score <= 40 ? '📉' : '📊';
    const topTicker = dashboardData.redditTrends?.[0]?.symbol || 'Markets';
    
    const subject = `${sentimentEmoji} Daily Brief: ${topTicker} Trending, ${sentiment?.label || 'Market Update'} - ${today}`;

    // 5. Send to each subscriber
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const subscriber of subscribers) {
      try {
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${subscriber.token}`;
        
        const emailHTML = generateEmailHTML({
          data: dashboardData,
          unsubscribeUrl,
        });

        await resend.emails.send({
          from: 'PutCall.nl <noreply@putcall.nl>',
          to: subscriber.email,
          subject: subject,
          html: emailHTML,
        });

        // Update last email sent timestamp in Supabase
        await updateLastEmailSent(subscriber.email);
        
        results.sent++;
        console.log(`✅ Sent to: ${subscriber.email}`);
        
        // Rate limit: Resend free tier allows ~10/sec
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error: any) {
        results.failed++;
        const errorMsg = `${subscriber.email}: ${error.message}`;
        results.errors.push(errorMsg);
        console.error(`❌ Failed:`, errorMsg);
      }
    }

    console.log(`📧 Newsletter complete: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${results.sent}/${subscribers.length} subscribers`,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
      subject: subject,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Newsletter error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
