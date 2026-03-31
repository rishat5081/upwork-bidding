import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getTemplates, saveTemplate, deleteTemplate } from '@/lib/db';
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
    const templates = getTemplates();
    return NextResponse.json(templates, { headers: corsHeaders() });
  } catch (error) {
    console.error('GET /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    seedDatabase();
    const body = await request.json();
    const id = body.id || uuidv4();
    const template = { ...body, id };
    saveTemplate(template);
    return NextResponse.json(template, { status: 201, headers: corsHeaders() });
  } catch (error) {
    console.error('POST /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
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

    saveTemplate(body);
    return NextResponse.json(body, { headers: corsHeaders() });
  } catch (error) {
    console.error('PUT /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
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

    deleteTemplate(body.id);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error('DELETE /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
