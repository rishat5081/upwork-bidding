import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/db';
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
    const profile = getProfile();
    return NextResponse.json(profile ?? {}, { headers: corsHeaders() });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    seedDatabase();
    const body = await request.json();
    saveProfile(body);
    return NextResponse.json(body, { headers: corsHeaders() });
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
