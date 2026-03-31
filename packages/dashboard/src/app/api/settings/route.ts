import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  try {
    seedDatabase();
    const settings = getSettings();
    return NextResponse.json(settings ?? {}, { headers: corsHeaders() });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    seedDatabase();
    const body = await request.json();
    saveSettings(body);
    return NextResponse.json(body, { headers: corsHeaders() });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
