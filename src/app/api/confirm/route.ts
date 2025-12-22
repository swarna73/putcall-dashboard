// app/api/confirm/route.ts
import { NextResponse } from 'next/server';
import { confirmSubscriber } from '@/utils/subscribers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing confirmation token' },
      { status: 400 }
    );
  }

  try {
    const result = await confirmSubscriber(token);

    if (!result.success) {
      // Return a specific flag for "already confirmed" case
      return NextResponse.json({
        success: false,
        alreadyConfirmed: true,
        error: result.error,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully!',
    });

  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing confirmation token' },
        { status: 400 }
      );
    }

    const result = await confirmSubscriber(token);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        alreadyConfirmed: true,
        error: result.error,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully!',
    });

  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}
