import { NextRequest, NextResponse } from 'next/server';
import { getJobById, saveJob, getProfile, getCaseStudies } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { scoreJob } from '@/lib/scoring';
import { generateProposal } from '@/lib/proposal';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const { id } = await params;
    const job = getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: corsHeaders() });
    }

    // Parse fields
    let skills: string[] = [];
    try {
      skills = job.skills ? JSON.parse(job.skills) : [];
    } catch {
      skills = [];
    }

    let screeningQuestions: string[] = [];
    try {
      screeningQuestions = job.screening_questions ? JSON.parse(job.screening_questions) : [];
    } catch {
      screeningQuestions = [];
    }

    const jobForScoring = {
      title: job.title,
      description: job.description,
      skills,
      budget: job.budget,
      budget_amount: job.budget_amount,
      job_type: job.job_type,
      hourly_range: job.hourly_range,
      experience_level: job.experience_level,
      payment_verified: job.payment_verified,
      client_hire_rate: job.client_hire_rate,
      client_total_spent: job.client_total_spent,
      client_hires: job.client_hires,
      proposal_count: job.proposal_count,
      category: job.category,
      screening_questions: screeningQuestions,
    };

    const profile = getProfile() ?? {};
    const caseStudies = getCaseStudies();

    // Re-score
    const score = scoreJob(
      jobForScoring,
      profile as Record<string, unknown>,
      caseStudies as Array<{
        id: string;
        technologies?: string[];
        tags?: string[];
        title?: string;
        problem?: string;
        solution?: string;
      }>,
    );

    // Regenerate proposal
    const proposal = generateProposal(
      jobForScoring,
      score,
      profile as Record<string, unknown>,
      caseStudies as Array<{
        id: string;
        title?: string;
        client?: string;
        problem?: string;
        solution?: string;
        technologies?: string[];
        tags?: string[];
        outcome?: string;
      }>,
    );

    // Update job
    saveJob({
      ...job,
      score_data: JSON.stringify(score),
      proposal_data: JSON.stringify(proposal),
    });

    return NextResponse.json({ score, proposal }, { headers: corsHeaders() });
  } catch (error) {
    console.error('POST /api/jobs/[id]/proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate proposal' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
