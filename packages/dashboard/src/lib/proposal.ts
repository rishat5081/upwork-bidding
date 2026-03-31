import type { JobScore } from './scoring';

// --------------- Types ---------------

export interface GeneratedProposal {
  openingLine: string;
  shortProposal: string;
  detailedProposal: string;
  relevantExperience: string[];
  firstStep: string;
  clarifyingQuestions: string[];
  cta: string;
  matchingCaseStudies: string[];
  matchingTechnologies: string[];
  strategy: 'confident' | 'cautious' | 'skip-note';
  skipReason?: string;
}

interface JobData {
  title: string;
  description: string;
  skills?: string[];
  budget?: string | null;
  budget_amount?: number | null;
  job_type?: string | null;
  hourly_range?: string | null;
  experience_level?: string | null;
  screening_questions?: string[];
  category?: string | null;
}

interface ProfileData {
  headline?: string;
  summary?: string;
  niche?: string;
  preferredStacks?: string[];
  yearsOfExperience?: number;
  workHistory?: Array<{
    company: string;
    role: string;
    period: string;
    description: string;
    highlights: string[];
  }>;
  skills?: Record<string, string[]>;
  proposalTone?: string;
}

interface CaseStudyData {
  id: string;
  title?: string;
  client?: string;
  problem?: string;
  solution?: string;
  technologies?: string[];
  tags?: string[];
  outcome?: string;
}

// --------------- Helpers ---------------

function lower(s: string | null | undefined): string {
  return (s ?? '').toLowerCase();
}

function findMatchingCaseStudies(job: JobData, caseStudies: CaseStudyData[]): CaseStudyData[] {
  const text = `${lower(job.title)} ${lower(job.description)} ${(job.skills ?? []).map((s) => lower(s)).join(' ')}`;
  const matches: { cs: CaseStudyData; overlap: number }[] = [];

  for (const cs of caseStudies) {
    const terms = [
      ...(cs.technologies ?? []).map((t) => lower(t)),
      ...(cs.tags ?? []).map((t) => lower(t)),
    ];
    let overlap = 0;
    for (const term of terms) {
      if (text.includes(term)) overlap++;
    }
    if (overlap >= 1) {
      matches.push({ cs, overlap });
    }
  }

  return matches.sort((a, b) => b.overlap - a.overlap).map((m) => m.cs);
}

function findMatchingTechnologies(job: JobData, profile: ProfileData): string[] {
  const text = `${lower(job.title)} ${lower(job.description)} ${(job.skills ?? []).map((s) => lower(s)).join(' ')}`;
  const allStacks = profile.preferredStacks ?? [];
  const matched: string[] = [];

  for (const stack of allStacks) {
    if (text.includes(lower(stack))) {
      matched.push(stack);
    }
  }

  return [...new Set(matched)];
}

function extractKeyProblem(job: JobData): string {
  const desc = job.description ?? '';
  // Split on sentence boundaries but not on abbreviations like "Node.js", "e.g.", etc.
  const sentences = desc.split(/(?<!\b[A-Za-z])[.!?]+\s+/).filter((s) => s.trim().length > 10);
  // Look for problem-indicating sentences
  const problemSentence = sentences.find((s) =>
    /\b(need|looking for|want|require|must|should|help|build|create|develop|fix|debug|integrate)\b/i.test(
      s,
    ),
  );
  return problemSentence?.trim() ?? sentences[0]?.trim() ?? job.title;
}

function pickOpeningLine(
  job: JobData,
  matchingTechs: string[],
  matchingStudies: CaseStudyData[],
): string {
  const title = job.title;
  const problem = extractKeyProblem(job);
  const techList = matchingTechs.slice(0, 3).join(', ');
  const hasStudy = matchingStudies.length > 0;

  const templates = [
    `I read your post about "${title}" and the requirements line up directly with the backend systems I build daily.`,
    `Your project caught my attention because ${techList ? `I work with ${techList} daily` : 'it aligns with my backend specialization'}.`,
    `I've built systems that solve exactly this type of problem${hasStudy ? ` \u2014 most recently for ${matchingStudies[0]?.client ?? 'a client'}` : ''}.`,
    `This is right in my wheelhouse. ${techList ? `I've shipped production ${techList} systems` : 'I specialize in exactly this type of backend work'} for the past 6 years.`,
    `I can help with this. I've handled ${problem.length < 60 ? `"${problem}"` : 'similar requirements'} in previous projects.`,
    `The technical requirements here map well to my experience \u2014 ${techList ? `particularly ${techList}` : 'backend API work is my core focus'}.`,
    `I've read through your requirements carefully. ${hasStudy ? `I recently completed a similar project (${matchingStudies[0]?.title}).` : 'This matches the type of backend work I specialize in.'}`,
    `Your ${title.toLowerCase().includes('api') ? 'API' : 'backend'} project aligns with work I've been doing for 6+ years.`,
    `I noticed you need ${techList || 'backend development work'} \u2014 I've built and maintained these systems in production at scale.`,
    `This looks like a solid project. I have direct experience with ${techList || 'the stack and approach you need'}.`,
  ];

  // Pick based on a hash of the title for determinism
  const hash = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

function generateFirstStep(job: JobData, matchingTechs: string[]): string {
  const desc = lower(job.description);

  if (desc.includes('api') && desc.includes('integrat')) {
    return `First, I'd review the API documentation for the integration points you mentioned, map the data flow, and set up a proof-of-concept connection to validate the approach before building the full pipeline.`;
  }
  if (desc.includes('webhook')) {
    return `I'd start by setting up the webhook endpoint with proper validation and logging, then build the processing pipeline step by step, testing each stage with real payloads.`;
  }
  if (desc.includes('debug') || desc.includes('fix') || desc.includes('performance')) {
    return `First step would be to get access to the codebase and any error logs/monitoring, reproduce the issue locally, and trace the root cause before making any changes.`;
  }
  if (desc.includes('database') || desc.includes('migration') || desc.includes('schema')) {
    return `I'd start by reviewing the current database schema and data patterns, then design the migration strategy with rollback support before touching any production data.`;
  }
  if (desc.includes('saas') || desc.includes('multi-tenant')) {
    return `First, I'd map out the data isolation strategy and core entity relationships, then set up the project structure with proper tenant context handling from day one.`;
  }
  if (matchingTechs.includes('AWS') || desc.includes('aws') || desc.includes('deploy')) {
    return `I'd start by reviewing the current infrastructure setup, documenting what's needed, and setting up the core AWS services with proper IAM roles and security before deploying any application code.`;
  }
  if (matchingTechs.includes('NestJS') || matchingTechs.includes('Node.js')) {
    return `First step: I'd set up the project structure with proper module organization, configure the essential middleware (auth, logging, error handling), and build the first core endpoint to validate the architecture.`;
  }

  return `I'd start by reviewing your existing setup and requirements in detail, then outline the technical approach and timeline before writing any code. Clear alignment upfront saves time downstream.`;
}

function generateQuestions(job: JobData): string[] {
  const desc = lower(job.description);
  const questions: string[] = [];

  if (!desc.includes('authentication') && !desc.includes('auth')) {
    questions.push('What authentication/authorization approach are you using or planning to use?');
  }
  if (desc.includes('api') && !desc.includes('documentation') && !desc.includes('doc')) {
    questions.push('Is there existing API documentation or specs I can review?');
  }
  if (
    !desc.includes('deploy') &&
    !desc.includes('hosting') &&
    !desc.includes('aws') &&
    !desc.includes('server')
  ) {
    questions.push('What is the target deployment environment (AWS, Heroku, VPS, etc.)?');
  }
  if (desc.includes('exist') || desc.includes('current') || desc.includes('legacy')) {
    questions.push('Can I get access to the existing codebase and any documentation?');
  }
  if (!desc.includes('timeline') && !desc.includes('deadline') && !desc.includes('urgent')) {
    questions.push('What is the expected timeline for this project?');
  }
  if (!desc.includes('test') && !desc.includes('testing')) {
    questions.push(
      'Do you have existing tests, or should I include test coverage as part of the deliverables?',
    );
  }
  if (desc.includes('database') && !desc.includes('existing data')) {
    questions.push(
      'Is there existing data that needs to be migrated, or is this a fresh database?',
    );
  }

  return questions.slice(0, 3);
}

function generateCta(job: JobData, strategy: 'confident' | 'cautious' | 'skip-note'): string {
  if (strategy === 'skip-note') {
    return 'This project may not be the best match for my specialization, but I am happy to discuss if you think there is alignment.';
  }

  const ctas = [
    'I am available to start this week. Want to schedule a quick call to discuss the technical approach?',
    'Let me know if you would like to discuss the implementation details. I can share relevant code samples.',
    'Happy to walk through my approach in more detail. When works for a brief chat?',
    'I can start immediately. Want me to outline a more detailed technical plan?',
    'Let me know if this resonates. I can provide a detailed breakdown of the implementation phases.',
  ];

  const hash = (job.title ?? '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ctas[hash % ctas.length];
}

// --------------- Main Generation Function ---------------

export function generateProposal(
  job: JobData,
  score: JobScore,
  profile: ProfileData,
  caseStudies: CaseStudyData[],
): GeneratedProposal {
  // Determine strategy
  let strategy: GeneratedProposal['strategy'];
  let skipReason: string | undefined;

  if (score.label === 'Strong Fit') {
    strategy = 'confident';
  } else if (score.label === 'Possible Fit') {
    strategy = 'cautious';
  } else {
    strategy = 'skip-note';
    skipReason =
      score.redFlags.length > 0
        ? `Not recommended: ${score.redFlags.slice(0, 2).join('; ')}`
        : 'Low overall score - poor niche/stack alignment';
  }

  // Find matches
  const matchingStudies = findMatchingCaseStudies(job, caseStudies);
  const matchingTechs = findMatchingTechnologies(job, profile);

  // Generate opening
  const openingLine = pickOpeningLine(job, matchingTechs, matchingStudies);

  // Generate first step
  const firstStep = generateFirstStep(job, matchingTechs);

  // Build relevant experience bullets
  const relevantExperience: string[] = [];
  if (matchingStudies.length > 0) {
    for (const cs of matchingStudies.slice(0, 3)) {
      relevantExperience.push(`${cs.title}: ${cs.outcome ?? cs.solution?.slice(0, 100)}`);
    }
  }
  // Add work history references
  const workHistory = profile.workHistory ?? [];
  for (const wh of workHistory) {
    const whText = lower(`${wh.description} ${wh.highlights.join(' ')}`);
    const jobText = lower(`${job.title} ${job.description}`);
    const overlap = wh.highlights.filter((h) => jobText.includes(lower(h.split(' ')[0]))).length;
    if (overlap > 0 || (whText.includes('api') && jobText.includes('api'))) {
      relevantExperience.push(
        `${wh.role} at ${wh.company} (${wh.period}): ${wh.highlights.slice(0, 2).join(', ')}`,
      );
    }
  }

  // Clarifying questions
  const clarifyingQuestions = generateQuestions(job);

  // CTA
  const cta = generateCta(job, strategy);

  // Build short proposal (5-8 sentences)
  const shortParts: string[] = [];
  shortParts.push(openingLine);

  if (strategy === 'skip-note') {
    shortParts.push(`Note: ${skipReason}`);
    shortParts.push('If you believe there is alignment, I am open to discussing further.');
  } else {
    // First step
    shortParts.push(firstStep);

    // Experience
    if (matchingStudies.length > 0) {
      const topStudy = matchingStudies[0];
      shortParts.push(
        `I recently built a similar system: ${topStudy.title} \u2014 ${topStudy.outcome ?? 'delivered successfully'}.`,
      );
    }

    // Tech alignment
    if (matchingTechs.length > 0) {
      shortParts.push(
        `I work with ${matchingTechs.slice(0, 4).join(', ')} daily in production environments.`,
      );
    }

    // Approach
    if (strategy === 'confident') {
      shortParts.push(
        'I have 6+ years of experience building exactly these types of backend systems.',
      );
    } else {
      shortParts.push(
        'I have experience with related systems and am confident I can deliver solid results.',
      );
    }

    shortParts.push(cta);
  }

  const shortProposal = shortParts.join('\n\n');

  // Build detailed proposal
  const detailedParts: string[] = [];
  detailedParts.push(`## Opening\n\n${openingLine}`);

  detailedParts.push(
    `## Understanding\n\nBased on your post, you need: ${extractKeyProblem(job)}. ${
      job.skills && job.skills.length > 0
        ? `The technical requirements include ${job.skills.slice(0, 5).join(', ')}.`
        : ''
    }`,
  );

  detailedParts.push(`## My Approach\n\n${firstStep}`);

  if (relevantExperience.length > 0) {
    detailedParts.push(
      `## Relevant Experience\n\n${relevantExperience.map((e) => `- ${e}`).join('\n')}`,
    );
  }

  if (matchingTechs.length > 0) {
    detailedParts.push(
      `## Technology Alignment\n\nI work with ${matchingTechs.join(', ')} daily. These are production tools in my active toolkit, not resume padding.`,
    );
  }

  if (matchingStudies.length > 0) {
    detailedParts.push(
      `## Similar Projects\n\n${matchingStudies
        .slice(0, 2)
        .map(
          (cs) =>
            `**${cs.title}** (${cs.client}): ${cs.solution?.slice(0, 200)}... Technologies: ${cs.technologies?.join(', ')}`,
        )
        .join('\n\n')}`,
    );
  }

  detailedParts.push(`## Next Steps\n\n${cta}`);

  if (clarifyingQuestions.length > 0) {
    detailedParts.push(
      `## Questions\n\n${clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
    );
  }

  const detailedProposal = detailedParts.join('\n\n');

  return {
    openingLine,
    shortProposal,
    detailedProposal,
    relevantExperience: relevantExperience.slice(0, 5),
    firstStep,
    clarifyingQuestions,
    cta,
    matchingCaseStudies: matchingStudies.map((cs) => cs.id),
    matchingTechnologies: matchingTechs,
    strategy,
    skipReason,
  };
}
