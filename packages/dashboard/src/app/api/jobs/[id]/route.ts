import { NextRequest, NextResponse } from 'next/server';
import { getJobById, saveJob, updateJobStatus, updateJobNotes, deleteJob } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const { id } = await params;
    const job = getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: corsHeaders() });
    }

    return NextResponse.json(job, { headers: corsHeaders() });
  } catch (error) {
    console.error('GET /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const { id } = await params;
    const body = await request.json();

    const existing = getJobById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: corsHeaders() });
    }

    // Update specific fields
    if (body.status !== undefined) {
      updateJobStatus(id, body.status);
    }
    if (body.notes !== undefined) {
      updateJobNotes(id, body.notes);
    }

    // If other fields are present, do a full update
    if (body.title || body.description || body.score_data || body.proposal_data) {
      saveJob({
        ...existing,
        ...body,
        id,
        extracted_at: existing.extracted_at,
      });
    }

    const updated = getJobById(id);
    return NextResponse.json(updated, { headers: corsHeaders() });
  } catch (error) {
    console.error('PUT /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    seedDatabase();
    const { id } = await params;
    const existing = getJobById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: corsHeaders() });
    }

    deleteJob(id);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error('DELETE /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
