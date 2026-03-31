import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAllJobs, saveJob, getProfile, getCaseStudies } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { scoreJob } from '@/lib/scoring';
import { generateProposal } from '@/lib/proposal';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    seedDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;

    const jobs = getAllJobs(status);

    return NextResponse.json(jobs, { headers: corsHeaders() });
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    seedDatabase();

    const body = await request.json();

    // Generate an ID if not provided
    const id = body.id || uuidv4();

    // Parse skills and screening questions if they're strings
    let skills: string[] = [];
    if (typeof body.skills === 'string') {
      try {
        skills = JSON.parse(body.skills);
      } catch {
        skills = [];
      }
    } else if (Array.isArray(body.skills)) {
      skills = body.skills;
    }

    let screeningQuestions: string[] = [];
    if (typeof body.screening_questions === 'string') {
      try {
        screeningQuestions = JSON.parse(body.screening_questions);
      } catch {
        screeningQuestions = [];
      }
    } else if (typeof body.screeningQuestions === 'string') {
      try {
        screeningQuestions = JSON.parse(body.screeningQuestions);
      } catch {
        screeningQuestions = [];
      }
    } else if (Array.isArray(body.screening_questions)) {
      screeningQuestions = body.screening_questions;
    } else if (Array.isArray(body.screeningQuestions)) {
      screeningQuestions = body.screeningQuestions;
    }

    // Build the job data for scoring
    const jobForScoring = {
      title: body.title ?? 'Untitled Job',
      description: body.description ?? '',
      skills,
      budget: body.budget ?? null,
      budget_amount: body.budget_amount ?? body.budgetAmount ?? null,
      job_type: body.job_type ?? body.jobType ?? null,
      hourly_range: body.hourly_range ?? body.hourlyRange ?? null,
      experience_level: body.experience_level ?? body.experienceLevel ?? null,
      payment_verified: body.payment_verified ?? body.paymentVerified ?? null,
      client_hire_rate: body.client_hire_rate ?? body.clientHireRate ?? null,
      client_total_spent: body.client_total_spent ?? body.clientTotalSpent ?? null,
      client_hires: body.client_hires ?? body.clientHires ?? null,
      proposal_count: body.proposal_count ?? body.proposalCount ?? null,
      category: body.category ?? null,
      screening_questions: screeningQuestions,
    };

    // Get profile and case studies for scoring
    const profile = getProfile() ?? {};
    const caseStudies = getCaseStudies();

    // Score the job
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

    // Generate proposal
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

    // Save the job
    const now = new Date().toISOString();
    saveJob({
      id,
      title: body.title ?? 'Untitled Job',
      description: body.description ?? '',
      client_country: body.client_country ?? body.clientCountry ?? null,
      payment_verified: (body.payment_verified ?? body.paymentVerified) ? 1 : 0,
      budget: body.budget ?? null,
      budget_amount: body.budget_amount ?? body.budgetAmount ?? null,
      job_type: body.job_type ?? body.jobType ?? null,
      hourly_range: body.hourly_range ?? body.hourlyRange ?? null,
      experience_level: body.experience_level ?? body.experienceLevel ?? null,
      estimated_duration: body.estimated_duration ?? body.estimatedDuration ?? null,
      project_type: body.project_type ?? body.projectType ?? null,
      category: body.category ?? null,
      client_hire_rate: body.client_hire_rate ?? body.clientHireRate ?? null,
      client_total_spent: body.client_total_spent ?? body.clientTotalSpent ?? null,
      client_hires: body.client_hires ?? body.clientHires ?? null,
      proposal_count: body.proposal_count ?? body.proposalCount ?? null,
      skills: JSON.stringify(skills),
      posted_time: body.posted_time ?? body.postedTime ?? null,
      screening_questions: JSON.stringify(screeningQuestions),
      connects_required: body.connects_required ?? body.connectsRequired ?? null,
      url: body.url ?? null,
      extracted_at: body.extracted_at ?? body.extractedAt ?? now,
      score_data: JSON.stringify(score),
      proposal_data: JSON.stringify(proposal),
      notes: body.notes ?? null,
      status: body.status ?? 'new',
      saved_at: now,
    });

    return NextResponse.json(
      {
        id,
        score,
        proposal,
        status: 'new',
        saved_at: now,
      },
      { status: 201, headers: corsHeaders() },
    );
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to save job', details: String(error) },
      { status: 500, headers: corsHeaders() },
    );
  }
}
