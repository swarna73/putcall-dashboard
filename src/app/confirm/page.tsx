import { NextResponse } from 'next/server';
import { confirmSubscriber } from '@/utils/subscribers';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Confirmation token is required' },
        { status: 400 }
      );
    }

    const result = await confirmSubscriber(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid confirmation token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your subscription is confirmed! You\'ll receive daily market updates starting tomorrow.',
    });

  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}
