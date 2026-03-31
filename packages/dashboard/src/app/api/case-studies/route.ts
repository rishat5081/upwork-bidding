import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCaseStudies, saveCaseStudy, deleteCaseStudy } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  try {
    seedDatabase();
    const caseStudies = getCaseStudies();
    return NextResponse.json(caseStudies, { headers: corsHeaders() });
  } catch (error) {
    console.error('GET /api/case-studies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    seedDatabase();
    const body = await request.json();
    const id = body.id || uuidv4();
    const cs = { ...body, id };
    saveCaseStudy(cs);
    return NextResponse.json(cs, { status: 201, headers: corsHeaders() });
  } catch (error) {
    console.error('POST /api/case-studies error:', error);
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    seedDatabase();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400, headers: corsHeaders() },
      );
    }

    saveCaseStudy(body);
    return NextResponse.json(body, { headers: corsHeaders() });
  } catch (error) {
    console.error('PUT /api/case-studies error:', error);
    return NextResponse.json(
      { error: 'Failed to update case study' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    seedDatabase();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400, headers: corsHeaders() },
      );
    }

    deleteCaseStudy(body.id);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error('DELETE /api/case-studies error:', error);
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
