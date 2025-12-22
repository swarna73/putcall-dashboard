// app/api/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { unsubscribe } from '@/utils/subscribers';

// Handle POST request (from page button click)
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Missing unsubscribe token' },
        { status: 400 }
      );
    }

    const result = await unsubscribe(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid or expired unsubscribe token' },
        { status: 400 }
      );
    }

    console.log('✅ User unsubscribed successfully');

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from PutCall.nl emails.',
    });
  } catch (error: any) {
    console.error('❌ Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}

// Handle GET request (direct link click from email - redirect to page)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing unsubscribe token' },
      { status: 400 }
    );
  }

  // Redirect to the unsubscribe page with the token
  return NextResponse.redirect(
    new URL(`/unsubscribe?token=${token}`, request.url)
  );
}
