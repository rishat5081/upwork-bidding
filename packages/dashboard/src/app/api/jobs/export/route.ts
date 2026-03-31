import { NextResponse } from 'next/server';
import { getAllJobs } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  try {
    seedDatabase();
    const jobs = getAllJobs();

    // Parse JSON fields for cleaner export
    const exportData = jobs.map((job) => ({
      ...job,
      skills: (() => {
        try {
          return job.skills ? JSON.parse(job.skills) : [];
        } catch {
          return [];
        }
      })(),
      screening_questions: (() => {
        try {
          return job.screening_questions ? JSON.parse(job.screening_questions) : [];
        } catch {
          return [];
        }
      })(),
      score_data: (() => {
        try {
          return job.score_data ? JSON.parse(job.score_data) : null;
        } catch {
          return null;
        }
      })(),
      proposal_data: (() => {
        try {
          return job.proposal_data ? JSON.parse(job.proposal_data) : null;
        } catch {
          return null;
        }
      })(),
    }));

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="upwork-bidder-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('GET /api/jobs/export error:', error);
    return NextResponse.json(
      { error: 'Failed to export jobs' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
