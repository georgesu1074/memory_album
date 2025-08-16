import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      database: 'not_configured',
      storage: 'not_configured',
      vector_db: 'not_configured',
      ai: 'not_configured',
    }
  });
}