import { NextResponse } from 'next/server';
import { generateEmailHTML } from '@/utils/email-template';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch current dashboard data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/dashboard`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    const dashboardData = await response.json();
    
    // Generate email HTML
    const emailHTML = generateEmailHTML({
      data: dashboardData,
      unsubscribeUrl: 'https://putcall.nl/unsubscribe?token=PREVIEW_TOKEN'
    });
    
    // Return HTML for preview
    return new NextResponse(emailHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
    
  } catch (error: any) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
