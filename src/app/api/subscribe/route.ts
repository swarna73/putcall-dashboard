import { NextResponse } from 'next/server';
import { validateEmail } from '@/utils/email-validator';
import { addSubscriber } from '@/utils/subscribers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email format and domain
    const validation = await validateEmail(email);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Add subscriber to database
    const result = await addSubscriber(validation.email!);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Send confirmation email
    const subscriber = result.subscriber!;
    const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://putcall.nl'}/confirm?token=${subscriber.confirmToken}`;

    try {
      await resend.emails.send({
        from: 'PutCall.nl <noreply@putcall.nl>',
        to: subscriber.email,
        subject: '✅ Confirm your PutCall.nl subscription',
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
      <h1 style="margin: 0; font-size: 28px;">📊 Welcome to PutCall.nl</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #ffffff; margin-top: 0;">One more step...</h2>
      
      <p style="color: #cbd5e1; line-height: 1.6;">
        Thanks for subscribing to the PutCall.nl Daily Market Brief! You'll receive:
      </p>
      
      <ul style="color: #cbd5e1; line-height: 1.8;">
        <li>📈 Top Reddit trending stocks with sentiment analysis</li>
        <li>💎 Value stock picks from fundamentals screener</li>
        <li>✅ Cross-platform validation (Reddit vs Institutional)</li>
        <li>📰 Breaking financial news and market insights</li>
      </ul>
      
      <p style="color: #cbd5e1; line-height: 1.6;">
        <strong>Please confirm your email address to start receiving daily updates:</strong>
      </p>
      
      <div style="text-align: center;">
        <a href="${confirmUrl}" class="button">
          Confirm Subscription
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
        If you didn't subscribe to PutCall.nl, you can safely ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} PutCall.nl • AI-Powered Market Intelligence</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Please check your email to confirm your subscription',
    });

  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
