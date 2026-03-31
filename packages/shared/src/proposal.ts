import type { ExtractedJob, JobScore, UserProfile, CaseStudy, GeneratedProposal } from './types';

// ─── Opening line templates ─────────────────────────────────────────────────

const OPENING_LINES_CONFIDENT: string[] = [
  "I've built a similar {matchType} -- let me walk you through how I'd approach this.",
  'Your {jobTitle} maps directly to work I delivered for {clientName}, where I {achievement}.',
  'This is right in my wheelhouse. I recently {achievement} using the same stack you need.',
  "I've shipped production {matchType} systems with {techStack} -- here's how I'd tackle yours.",
  'Having built {matchType} pipelines for {clientName}, I can hit the ground running on this.',
  'Your requirements align closely with a {matchType} system I built that {outcome}.',
  "I've solved this exact problem before. At {clientName}, I {achievement}.",
  'This is the kind of {matchType} work I specialize in -- {yearsExp}+ years of hands-on backend delivery.',
];

const OPENING_LINES_CAUTIOUS: string[] = [
  "Your project caught my attention -- while it's not an exact match, my {matchType} experience transfers directly.",
  "I've worked on adjacent problems in the {matchType} space and can bring relevant experience to this.",
  'My background in {techStack} gives me a solid foundation for the {matchType} work you need.',
  "I don't have exact experience with {specificTech}, but I've built similar {matchType} systems and pick up fast.",
  "This is an interesting {matchType} challenge. Here's how my backend experience would apply.",
];

const OPENING_LINES_SKIP: string[] = [
  "I reviewed this job and it's outside my core focus area. Here's why and what I'd recommend.",
  "After reviewing the requirements, this isn't the strongest match for my skill set.",
  "Flagging this one as a pass -- the scope doesn't align well with my backend/API specialization.",
];

// ─── First step templates ───────────────────────────────────────────────────

const FIRST_STEP_TEMPLATES: Record<string, string> = {
  api: "First, I'd audit your current API endpoints and data flow to map out what's working and what needs to change before writing any new code.",
  integration:
    "First, I'd review the APIs/services involved, test their endpoints, and document the data mapping between systems to build a solid integration plan.",
  webhook:
    "First, I'd map out the webhook event flow, set up a local tunnel to capture sample payloads, and design the processing pipeline with proper error handling.",
  database:
    "First, I'd review your current schema and query patterns to identify optimization opportunities and plan the migration path.",
  debugging:
    "First, I'd reproduce the issue in a controlled environment, add instrumentation to trace the root cause, and document findings before proposing a fix.",
  saas: "First, I'd review the current architecture, understand the data model and tenant isolation approach, and identify the highest-impact improvements.",
  automation:
    "First, I'd document the current manual workflow end-to-end, identify the automation touchpoints, and prototype the most critical pipeline component.",
  general:
    "First, I'd schedule a quick call to clarify the technical requirements, review any existing code or documentation, and provide a concrete implementation plan within 24-48 hours.",
};

// ─── CTA templates ──────────────────────────────────────────────────────────

const CTA_CONFIDENT = [
  "I'm available to start this week. Want to jump on a quick call to discuss the technical approach?",
  "Let's set up a 15-minute call -- I can walk you through the architecture and share a concrete timeline.",
  "Happy to share a short screen recording of similar work I've done. When works to connect?",
  'I can start immediately and deliver a working prototype within the first week. Want to discuss the details?',
];

const CTA_CAUTIOUS = [
  "Want to connect for a quick chat? I'd like to understand the full scope before committing to a timeline.",
  "I'd love to learn more about the technical context. A short call would help me scope this accurately.",
  "If my background looks like a fit, let's connect -- I have a few clarifying questions that would help me give you an accurate estimate.",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function lower(text: string | undefined): string {
  return (text ?? '').toLowerCase();
}

function findMatchingCaseStudies(
  job: ExtractedJob,
  caseStudies: CaseStudy[],
): { study: CaseStudy; score: number }[] {
  const text = lower(job.title) + ' ' + lower(job.description);
  const jobSkillsLower = job.skills.map((s) => s.toLowerCase());

  const scored = caseStudies.map((cs) => {
    let matchScore = 0;

    for (const tech of cs.technologies) {
      const techLower = tech.toLowerCase();
      if (text.includes(techLower) || jobSkillsLower.includes(techLower)) {
        matchScore += 2;
      }
    }

    for (const tag of cs.tags) {
      if (text.includes(tag.toLowerCase())) {
        matchScore += 1.5;
      }
    }

    return { study: cs, score: matchScore };
  });

  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
}

function findMatchingTechnologies(job: ExtractedJob, profile: UserProfile): string[] {
  const text = lower(job.title) + ' ' + lower(job.description);
  const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
  const matched: string[] = [];

  for (const stack of profile.preferredStacks) {
    const stackLower = stack.toLowerCase();
    if (text.includes(stackLower) || jobSkillsLower.includes(stackLower)) {
      matched.push(stack);
    }
  }

  for (const cat of profile.skills) {
    for (const skill of cat.skills) {
      const base = skill.toLowerCase().split('(')[0].trim();
      if (
        !matched.some((m) => m.toLowerCase() === base) &&
        (text.includes(base) || jobSkillsLower.some((js) => js.includes(base)))
      ) {
        matched.push(skill);
      }
    }
  }

  return [...new Set(matched)];
}

function detectJobDomain(job: ExtractedJob): string {
  const text = lower(job.title) + ' ' + lower(job.description);

  if (text.includes('webhook')) return 'webhook';
  if (text.includes('integration') || text.includes('integrate')) return 'integration';
  if (text.includes('api')) return 'api';
  if (text.includes('database') || text.includes('postgresql') || text.includes('mongodb'))
    return 'database';
  if (text.includes('debug') || text.includes('fix') || text.includes('troubleshoot'))
    return 'debugging';
  if (text.includes('saas') || text.includes('multi-tenant')) return 'saas';
  if (text.includes('automat')) return 'automation';
  return 'general';
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

function pickByHash<T>(arr: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return arr[Math.abs(hash) % arr.length];
}

function generateClarifyingQuestions(job: ExtractedJob): string[] {
  const text = lower(job.title) + ' ' + lower(job.description);
  const questions: string[] = [];

  if (!job.budget && !job.budgetAmount && !job.hourlyRange) {
    questions.push('What is the budget range for this project, and is it fixed-price or hourly?');
  }

  if (!job.estimatedDuration) {
    questions.push('What is the expected timeline for delivery?');
  }

  if (!text.includes('existing') && !text.includes('current') && !text.includes('already')) {
    questions.push('Is this a greenfield build or are you working with an existing codebase?');
  }

  if (text.includes('api') || text.includes('integration')) {
    questions.push(
      'Do you have API documentation or access credentials ready for the third-party services involved?',
    );
  }

  if (text.includes('database') || text.includes('data')) {
    questions.push(
      'What is the current database setup, and approximately how much data are we working with?',
    );
  }

  if (
    text.includes('deploy') ||
    text.includes('hosting') ||
    text.includes('aws') ||
    text.includes('cloud')
  ) {
    questions.push(
      'What is your current hosting/deployment setup, and are there any infrastructure constraints?',
    );
  }

  if (!text.includes('test') && !text.includes('spec')) {
    questions.push('Are there existing tests or CI/CD pipelines in place?');
  }

  if (text.includes('team') || text.includes('collaborate')) {
    questions.push(
      'How large is the development team, and what does the current workflow look like?',
    );
  }

  // Return 2-3 most relevant questions
  return questions.slice(0, 3);
}

function buildRelevantExperience(
  matchedStudies: { study: CaseStudy; score: number }[],
  matchedTechs: string[],
  profile: UserProfile,
): string[] {
  const experience: string[] = [];

  // Add from case studies
  for (const { study } of matchedStudies.slice(0, 2)) {
    experience.push(`At ${study.client}, I ${study.solution.split('.')[0].toLowerCase()}.`);
  }

  // Add from work history
  for (const entry of profile.workHistory.slice(0, 2)) {
    const relevantHighlight = entry.highlights[0];
    if (relevantHighlight) {
      experience.push(`${entry.role} at ${entry.company}: ${relevantHighlight}`);
    }
  }

  // Add strongest evidence
  if (matchedTechs.length > 0) {
    experience.push(
      `Hands-on experience with ${matchedTechs.slice(0, 5).join(', ')} in production environments.`,
    );
  }

  return experience.slice(0, 4);
}

// ─── Short proposal builder ─────────────────────────────────────────────────

function buildShortProposal(
  job: ExtractedJob,
  openingLine: string,
  matchedStudies: { study: CaseStudy; score: number }[],
  matchedTechs: string[],
  profile: UserProfile,
  firstStep: string,
  cta: string,
): string {
  const sentences: string[] = [];

  // Sentence 1: Hook (opening line)
  sentences.push(openingLine);

  // Sentence 2: What you'd do first
  sentences.push(firstStep);

  // Sentence 3-4: Relevant experience with specifics
  if (matchedStudies.length > 0) {
    const topStudy = matchedStudies[0].study;
    sentences.push(
      `In a similar project for ${topStudy.client}, I ${topStudy.solution.split('.')[0].toLowerCase()}.`,
    );
    sentences.push(`The result: ${topStudy.outcome.split('.')[0].toLowerCase()}.`);
  } else {
    sentences.push(
      `I've spent ${profile.yearsOfExperience}+ years building backend systems with ${profile.preferredStacks.slice(0, 3).join(', ')}.`,
    );
    sentences.push(`My recent work focused on ${profile.niche}, which is directly relevant here.`);
  }

  // Sentence 5: Technical approach hint
  if (matchedTechs.length > 0) {
    sentences.push(
      `I'd approach this using ${matchedTechs.slice(0, 3).join(', ')}${matchedTechs.length > 3 ? ' and related tools' : ''} based on the requirements described.`,
    );
  } else {
    const _domain = detectJobDomain(job);
    sentences.push(
      `My approach would prioritize clean architecture, proper error handling, and production reliability from day one.`,
    );
  }

  // Sentence 6-7: Similar work reference
  if (matchedStudies.length > 1) {
    const secondStudy = matchedStudies[1].study;
    sentences.push(
      `I also built ${secondStudy.title.toLowerCase()} for ${secondStudy.client}, which involved similar technical challenges.`,
    );
  } else {
    sentences.push(
      `I've delivered ${profile.projects.length}+ projects in this space, all with production-grade code quality and documentation.`,
    );
  }

  // Sentence 8: CTA
  sentences.push(cta);

  return sentences.join(' ');
}

// ─── Detailed proposal builder ──────────────────────────────────────────────

function buildDetailedProposal(
  job: ExtractedJob,
  openingLine: string,
  matchedStudies: { study: CaseStudy; score: number }[],
  matchedTechs: string[],
  profile: UserProfile,
  firstStep: string,
  clarifyingQuestions: string[],
  cta: string,
  relevantExperience: string[],
): string {
  const sections: string[] = [];

  // Opening
  sections.push(openingLine);
  sections.push('');

  // Understanding the problem
  sections.push('UNDERSTANDING YOUR NEEDS:');
  const domain = detectJobDomain(job);
  const domainDescriptions: Record<string, string> = {
    api: 'API development and integration',
    integration: 'system integration and data sync',
    webhook: 'webhook processing and event-driven automation',
    database: 'database architecture and optimization',
    debugging: 'debugging and performance optimization',
    saas: 'SaaS platform development',
    automation: 'workflow automation and pipeline development',
    general: 'backend software development',
  };
  sections.push(
    `Based on your description, you need experienced help with ${domainDescriptions[domain] ?? domainDescriptions.general}. I've done this work professionally for ${profile.yearsOfExperience}+ years and can deliver a production-ready solution.`,
  );
  sections.push('');

  // Relevant experience
  sections.push('RELEVANT EXPERIENCE:');
  for (const exp of relevantExperience) {
    sections.push(`- ${exp}`);
  }
  sections.push('');

  // Technical approach
  sections.push('MY APPROACH:');
  sections.push(firstStep);
  if (matchedTechs.length > 0) {
    sections.push(
      `I'd leverage my production experience with ${matchedTechs.slice(0, 5).join(', ')} to deliver this efficiently.`,
    );
  }
  sections.push(
    'I follow a structured approach: understand requirements thoroughly, build incrementally with regular check-ins, and ensure everything is tested and documented before delivery.',
  );
  sections.push('');

  // Case studies
  if (matchedStudies.length > 0) {
    sections.push('SIMILAR WORK:');
    for (const { study } of matchedStudies.slice(0, 2)) {
      sections.push(`- ${study.title} (${study.client}): ${study.outcome}`);
    }
    sections.push('');
  }

  // Clarifying questions
  if (clarifyingQuestions.length > 0) {
    sections.push('A FEW QUESTIONS:');
    for (const q of clarifyingQuestions) {
      sections.push(`- ${q}`);
    }
    sections.push('');
  }

  // CTA
  sections.push(cta);

  return sections.join('\n');
}

// ─── Main proposal generator ────────────────────────────────────────────────

export function generateProposal(
  job: ExtractedJob,
  score: JobScore,
  profile: UserProfile,
  caseStudies: CaseStudy[],
): GeneratedProposal {
  const matchedStudies = findMatchingCaseStudies(job, caseStudies);
  const matchedTechs = findMatchingTechnologies(job, profile);
  const domain = detectJobDomain(job);
  const jobSeed = job.id + job.title;

  // Determine strategy
  let strategy: GeneratedProposal['strategy'];
  if (score.label === 'Strong Fit') strategy = 'confident';
  else if (score.label === 'Possible Fit') strategy = 'cautious';
  else strategy = 'skip-note';

  // Skip case
  if (strategy === 'skip-note') {
    const skipReasons: string[] = [];
    if (score.redFlags.length > 0) {
      skipReasons.push(...score.redFlags.slice(0, 2));
    }
    if (score.total < 30) {
      skipReasons.push('Overall score too low for a competitive proposal.');
    }

    return {
      openingLine: pickByHash(OPENING_LINES_SKIP, jobSeed),
      shortProposal: `This job scored ${score.total}/100 (${score.label}). ${skipReasons.join(' ')} Consider skipping or revisiting if the scope becomes clearer.`,
      detailedProposal: `SKIP RECOMMENDATION:\n\nScore: ${score.total}/100 (${score.label})\n\nReasons:\n${skipReasons.map((r) => `- ${r}`).join('\n')}\n\nIf the client updates the job description with more specific requirements, it may be worth re-evaluating.`,
      relevantExperience: [],
      firstStep: 'N/A -- recommended to skip this job.',
      clarifyingQuestions: [],
      cta: '',
      matchingCaseStudies: matchedStudies.map((s) => s.study.title),
      matchingTechnologies: matchedTechs,
      strategy: 'skip-note',
      skipReason: skipReasons.join(' '),
    };
  }

  // Build template variables
  const matchType =
    domain === 'api'
      ? 'API integration'
      : domain === 'webhook'
        ? 'webhook automation'
        : domain === 'integration'
          ? 'system integration'
          : domain === 'database'
            ? 'database optimization'
            : domain === 'debugging'
              ? 'debugging and performance'
              : domain === 'saas'
                ? 'SaaS backend'
                : domain === 'automation'
                  ? 'backend automation'
                  : 'backend';

  const topStudy = matchedStudies.length > 0 ? matchedStudies[0].study : null;
  const clientName = topStudy?.client ?? 'a recent client';
  const achievement = topStudy
    ? topStudy.solution.split('.')[0].toLowerCase()
    : `built scalable ${matchType} systems`;
  const techStack =
    matchedTechs.length > 0
      ? matchedTechs.slice(0, 3).join('/')
      : profile.preferredStacks.slice(0, 3).join('/');
  const outcome = topStudy
    ? topStudy.outcome.split('.')[0].toLowerCase()
    : 'delivered on time with production-grade quality';

  const templateVars: Record<string, string> = {
    matchType,
    jobTitle: job.title,
    clientName,
    achievement,
    techStack,
    outcome,
    yearsExp: String(profile.yearsOfExperience),
    specificTech: job.skills.length > 0 ? job.skills[0] : 'the specific stack',
  };

  // Select opening line
  const openingPool = strategy === 'confident' ? OPENING_LINES_CONFIDENT : OPENING_LINES_CAUTIOUS;
  const rawOpening = pickByHash(openingPool, jobSeed);
  const openingLine = fillTemplate(rawOpening, templateVars);

  // Build first step
  const firstStepTemplate = FIRST_STEP_TEMPLATES[domain] ?? FIRST_STEP_TEMPLATES.general;
  const firstStep = firstStepTemplate;

  // Generate clarifying questions
  const clarifyingQuestions = generateClarifyingQuestions(job);

  // CTA
  const ctaPool = strategy === 'confident' ? CTA_CONFIDENT : CTA_CAUTIOUS;
  const cta = pickByHash(ctaPool, jobSeed);

  // Relevant experience
  const relevantExperience = buildRelevantExperience(matchedStudies, matchedTechs, profile);

  // Build proposals
  const shortProposal = buildShortProposal(
    job,
    openingLine,
    matchedStudies,
    matchedTechs,
    profile,
    firstStep,
    cta,
  );

  const detailedProposal = buildDetailedProposal(
    job,
    openingLine,
    matchedStudies,
    matchedTechs,
    profile,
    firstStep,
    clarifyingQuestions,
    cta,
    relevantExperience,
  );

  return {
    openingLine,
    shortProposal,
    detailedProposal,
    relevantExperience,
    firstStep,
    clarifyingQuestions,
    cta,
    matchingCaseStudies: matchedStudies.map((s) => s.study.title),
    matchingTechnologies: matchedTechs,
    strategy,
  };
}
