import { NextResponse } from 'next/server';
import { confirmSubscriber, loadSubscribers } from '@/utils/subscribers';
import { generateEmailHTML } from '@/utils/email-template';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Confirmation token is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to confirm token:', token);

    // Find the subscriber before confirming
    const subscribers = await loadSubscribers();
    const subscriber = subscribers.find(s => s.confirmToken === token);

    if (!subscriber) {
      console.error('❌ Token not found in database');
      return NextResponse.json(
        { error: 'Invalid confirmation token' },
        { status: 400 }
      );
    }

    // Confirm the subscription
    const result = await confirmSubscriber(token);

    if (!result.success) {
      console.error('❌ Confirmation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Invalid confirmation token' },
        { status: 400 }
      );
    }

    console.log('✅ Confirmation successful for:', subscriber.email);

    // Define base URL and unsubscribe URL (needed for both emails)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://putcall.nl';
    const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${subscriber.token}`;

    // Send immediate welcome email with today's market brief
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      console.log('📊 Fetching dashboard data...');
      const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        
        // Generate the daily email
        const emailHTML = generateEmailHTML({
          data: dashboardData,
          unsubscribeUrl,
        });

        // Send the welcome email with today's market data
        await resend.emails.send({
	  from: 'PutCall.nl <noreply@putcall.nl>',
          to: subscriber.email,
          subject: `🎉 Welcome! Your First Daily Market Brief - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          html: emailHTML,
        });

        console.log('✅ Welcome email with market brief sent to:', subscriber.email);
      } else {
        console.warn('⚠️ Could not fetch dashboard data, sending simple welcome email');
        
        // Send simple welcome email if dashboard fails
        await resend.emails.send({
	  from: 'PutCall.nl <noreply@putcall.nl>',
          to: subscriber.email,
          subject: '🎉 Welcome to PutCall.nl Daily Market Brief!',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #020617;
      color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0b1221;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 40px 24px;
      text-align: center;
    }
    .content {
      padding: 40px 24px;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      margin: 24px 0;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🎉 You're Confirmed!</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #ffffff; margin-top: 0;">Welcome to PutCall.nl!</h2>
      
      <p style="color: #cbd5e1; line-height: 1.6;">
        Your subscription is confirmed! Starting tomorrow, you'll receive daily market briefs every morning with:
      </p>
      
      <ul style="color: #cbd5e1; line-height: 1.8;">
        <li>📈 Top Reddit trending stocks with sentiment analysis</li>
        <li>💎 Value stock picks from fundamentals screener</li>
        <li>✅ Cross-platform validation (Reddit vs Institutional)</li>
        <li>📰 Breaking financial news and market insights</li>
      </ul>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${baseUrl}" class="button">
          View Today's Dashboard
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
        You can unsubscribe anytime by clicking the link at the bottom of any email.
      </p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} PutCall.nl • AI-Powered Market Intelligence</p>
      <p><a href="${unsubscribeUrl}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
          `,
        });

        console.log('✅ Simple welcome email sent to:', subscriber.email);
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
      // Don't fail the confirmation if email fails - they're still subscribed
    }

    return NextResponse.json({
      success: true,
      message: 'Your subscription is confirmed! Check your inbox for today\'s market brief!',
    });

  } catch (error: any) {
    console.error('❌ Confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription: ' + error.message },
      { status: 500 }
    );
  }
}
