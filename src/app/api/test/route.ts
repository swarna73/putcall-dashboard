import { NextResponse } from 'next/server';

export async function GET() {
  // Diagnostic endpoint to check what environment variables are available
  const diagnostics = {
    hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
    hasApiKey: !!process.env.API_KEY,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('GEMINI') || key.includes('API')
    ),
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(diagnostics);
}
