import { NextResponse } from 'next/server';
import { confirmSubscriber, loadSubscribers } from '@/utils/subscribers';

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

    // Debug: Check if we can load subscribers
    try {
      const subscribers = await loadSubscribers();
      console.log('📊 Total subscribers in database:', subscribers.length);
      console.log('🔍 Looking for token:', token.substring(0, 10) + '...');
      
      const found = subscribers.find(s => s.confirmToken === token);
      if (found) {
        console.log('✅ Found subscriber:', found.email);
      } else {
        console.log('❌ Token not found in database');
        console.log('Available tokens:', subscribers.map(s => s.confirmToken?.substring(0, 10) + '...'));
      }
    } catch (debugError) {
      console.error('Debug error:', debugError);
    }

    const result = await confirmSubscriber(token);

    if (!result.success) {
      console.error('❌ Confirmation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Invalid confirmation token' },
        { status: 400 }
      );
    }

    console.log('✅ Confirmation successful!');

    return NextResponse.json({
      success: true,
      message: 'Your subscription is confirmed! You\'ll receive daily market updates starting tomorrow.',
    });

  } catch (error: any) {
    console.error('❌ Confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription: ' + error.message },
      { status: 500 }
    );
  }
}

