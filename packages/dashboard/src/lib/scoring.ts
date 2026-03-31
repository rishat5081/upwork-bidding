// --------------- Types ---------------

export interface JobScore {
  total: number;
  label: 'Strong Fit' | 'Possible Fit' | 'Skip';
  reasons: { text: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[];
  redFlags: string[];
  greenFlags: string[];
  dimensions: { name: string; score: number; maxScore: number; reason: string }[];
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
  payment_verified?: boolean | number | null;
  client_hire_rate?: string | null;
  client_total_spent?: string | null;
  client_hires?: number | null;
  proposal_count?: string | null;
  category?: string | null;
  screening_questions?: string[];
}

interface ProfileData {
  preferredStacks?: string[];
  preferredJobTypes?: string[];
  niche?: string;
  minimumBudget?: number;
  avoidList?: string[];
  yearsOfExperience?: number;
}

interface CaseStudyData {
  id: string;
  title?: string;
  technologies?: string[];
  tags?: string[];
  problem?: string;
  solution?: string;
}

// --------------- Helpers ---------------

function lower(s: string | null | undefined): string {
  return (s ?? '').toLowerCase();
}

function textContainsAny(text: string, keywords: string[]): string[] {
  const t = lower(text);
  return keywords.filter((k) => t.includes(lower(k)));
}

function parseProposalCount(val: string | null | undefined): number {
  if (!val) return -1;
  const cleaned = val.replace(/[^0-9-]/g, '');
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map(Number);
    return Math.round((parts[0] + (parts[1] || parts[0])) / 2);
  }
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? -1 : n;
}

function parseBudgetAmount(job: JobData): number {
  if (job.budget_amount && job.budget_amount > 0) return job.budget_amount;
  if (!job.budget) return 0;
  const match = job.budget.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// --------------- Scoring Dimensions ---------------

function scoreNicheMatch(job: JobData, profile: ProfileData): { score: number; reason: string } {
  const text = `${job.title} ${job.description} ${(job.skills ?? []).join(' ')} ${job.category ?? ''}`;
  const nicheKeywords = [
    'backend',
    'api',
    'integration',
    'webhook',
    'automation',
    'saas',
    'node',
    'nodejs',
    'node.js',
    'express',
    'nestjs',
    'rest',
    'restful',
    'server',
    'microservice',
    'pipeline',
    'cron',
    'queue',
    'worker',
    'database',
    'postgresql',
    'postgres',
    'mongodb',
    'redis',
    'aws',
    'lambda',
    'ec2',
    's3',
    'devops',
    'docker',
    'stripe',
    'payment',
    'billing',
    'subscription',
  ];
  const jobTypeKeywords = profile.preferredJobTypes?.map((j) => j.toLowerCase()) ?? [];
  const allKeywords = [...nicheKeywords, ...jobTypeKeywords];
  const matches = textContainsAny(text, allKeywords);
  const uniqueMatches = [...new Set(matches)];

  // Check avoid list
  const avoidMatches = textContainsAny(text, profile.avoidList ?? []);

  if (avoidMatches.length > 0) {
    return { score: 1, reason: `Matches avoid list: ${avoidMatches.join(', ')}` };
  }

  if (uniqueMatches.length >= 6)
    return { score: 10, reason: `Strong niche alignment: ${uniqueMatches.slice(0, 6).join(', ')}` };
  if (uniqueMatches.length >= 4)
    return { score: 8, reason: `Good niche match: ${uniqueMatches.slice(0, 5).join(', ')}` };
  if (uniqueMatches.length >= 2)
    return { score: 5, reason: `Partial niche match: ${uniqueMatches.join(', ')}` };
  if (uniqueMatches.length === 1)
    return { score: 3, reason: `Weak niche match: ${uniqueMatches[0]}` };
  return { score: 1, reason: 'No niche match detected' };
}

function scoreStackMatch(job: JobData, profile: ProfileData): { score: number; reason: string } {
  const text = `${job.title} ${job.description} ${(job.skills ?? []).join(' ')}`;
  const stacks = profile.preferredStacks ?? [];
  const matches = textContainsAny(text, stacks);
  const uniqueMatches = [...new Set(matches)];

  if (uniqueMatches.length >= 5)
    return {
      score: 10,
      reason: `Excellent stack overlap: ${uniqueMatches.slice(0, 6).join(', ')}`,
    };
  if (uniqueMatches.length >= 3)
    return { score: 8, reason: `Good stack overlap: ${uniqueMatches.join(', ')}` };
  if (uniqueMatches.length >= 2)
    return { score: 6, reason: `Some stack overlap: ${uniqueMatches.join(', ')}` };
  if (uniqueMatches.length === 1)
    return { score: 4, reason: `Minimal stack overlap: ${uniqueMatches[0]}` };
  return { score: 1, reason: 'No preferred stack match' };
}

function scoreClarityOfScope(job: JobData): { score: number; reason: string } {
  const desc = job.description ?? '';
  const wordCount = desc.split(/\s+/).length;
  const hasTechnicalDetail =
    /\b(api|endpoint|database|server|deploy|integrate|webhook|cron|migration|schema|query|auth|jwt|oauth)\b/i.test(
      desc,
    );
  const hasDeliverables =
    /\b(deliverable|milestone|requirement|feature|functionality|module|endpoint|page|screen)\b/i.test(
      desc,
    );
  const hasScreeningQuestions = (job.screening_questions ?? []).length > 0;

  let score = 2;
  if (wordCount > 200) score += 2;
  if (wordCount > 100) score += 1;
  if (hasTechnicalDetail) score += 2;
  if (hasDeliverables) score += 2;
  if (hasScreeningQuestions) score += 1;

  score = Math.min(score, 10);

  const parts: string[] = [];
  if (wordCount < 50) parts.push('Very short description');
  else if (wordCount > 200) parts.push('Detailed description');
  else parts.push('Moderate description length');
  if (hasTechnicalDetail) parts.push('has technical details');
  if (hasDeliverables) parts.push('mentions deliverables');

  return { score, reason: parts.join(', ') };
}

function scoreClientTrust(job: JobData): { score: number; reason: string } {
  let score = 3;
  const parts: string[] = [];

  if (job.payment_verified) {
    score += 2;
    parts.push('Payment verified');
  } else {
    parts.push('Payment not verified');
  }

  const hires = job.client_hires ?? 0;
  if (hires > 10) {
    score += 2;
    parts.push(`${hires} past hires`);
  } else if (hires > 3) {
    score += 1;
    parts.push(`${hires} past hires`);
  } else {
    parts.push('Few or no past hires');
  }

  const spent = job.client_total_spent ?? '';
  if (/\$\d/.test(spent)) {
    const spentNum = parseFloat(spent.replace(/[^0-9.]/g, ''));
    if (spentNum > 10000) {
      score += 2;
      parts.push(`$${spentNum.toLocaleString()} total spent`);
    } else if (spentNum > 1000) {
      score += 1;
      parts.push(`$${spentNum.toLocaleString()} total spent`);
    }
  }

  const hireRate = job.client_hire_rate ?? '';
  if (hireRate) {
    const rateNum = parseFloat(hireRate.replace(/[^0-9.]/g, ''));
    if (rateNum > 50) {
      score += 1;
      parts.push(`${rateNum}% hire rate`);
    }
  }

  return { score: Math.min(score, 10), reason: parts.join(', ') || 'No client info available' };
}

function scoreBudgetReasonableness(
  job: JobData,
  profile: ProfileData,
): { score: number; reason: string } {
  const budgetAmount = parseBudgetAmount(job);
  const minimumBudget = profile.minimumBudget ?? 500;

  if (budgetAmount <= 0) {
    if (job.hourly_range) {
      return { score: 6, reason: `Hourly: ${job.hourly_range}` };
    }
    return { score: 4, reason: 'No budget specified' };
  }

  if (budgetAmount >= minimumBudget * 2)
    return {
      score: 10,
      reason: `Budget $${budgetAmount} is well above minimum ($${minimumBudget})`,
    };
  if (budgetAmount >= minimumBudget)
    return { score: 7, reason: `Budget $${budgetAmount} meets minimum ($${minimumBudget})` };
  if (budgetAmount >= minimumBudget * 0.6)
    return { score: 4, reason: `Budget $${budgetAmount} is below minimum ($${minimumBudget})` };
  return { score: 2, reason: `Budget $${budgetAmount} is far below minimum ($${minimumBudget})` };
}

function scoreComplexityFit(job: JobData, profile: ProfileData): { score: number; reason: string } {
  const desc = lower(job.description);
  const expLevel = lower(job.experience_level);
  const years = profile.yearsOfExperience ?? 6;

  let score = 5;
  const parts: string[] = [];

  // Check if complexity matches experience
  if (expLevel.includes('expert') || expLevel.includes('senior')) {
    score += 2;
    parts.push('Senior/Expert level matches experience');
  } else if (expLevel.includes('intermediate')) {
    score += 1;
    parts.push('Intermediate level');
  } else if (expLevel.includes('entry')) {
    score -= 1;
    parts.push('Entry level may be too simple');
  }

  // Overly complex (wants everything)
  const buzzwordCount = [
    'fullstack',
    'full-stack',
    'mobile',
    'ios',
    'android',
    'blockchain',
    'web3',
    'machine learning',
    'data science',
    'devops',
    'frontend',
    'backend',
    'design',
  ].filter((b) => desc.includes(b)).length;
  if (buzzwordCount >= 5) {
    score -= 3;
    parts.push('Unrealistically broad scope');
  } else if (buzzwordCount >= 3) {
    score -= 1;
    parts.push('Broad scope');
  }

  // Simple tasks
  const simpleIndicators = [
    'simple',
    'quick fix',
    'small task',
    'easy',
    'basic website',
    'landing page',
  ].filter((s) => desc.includes(s));
  if (simpleIndicators.length > 0 && years > 4) {
    score -= 2;
    parts.push('May be too simple for experience level');
  }

  return {
    score: Math.max(1, Math.min(score, 10)),
    reason: parts.join(', ') || 'Complexity seems appropriate',
  };
}

function scoreCompetitiveness(job: JobData): { score: number; reason: string } {
  const count = parseProposalCount(job.proposal_count);

  if (count < 0) return { score: 5, reason: 'Proposal count unknown' };
  if (count <= 5) return { score: 10, reason: `Only ${count} proposals - low competition` };
  if (count <= 10) return { score: 8, reason: `${count} proposals - moderate competition` };
  if (count <= 20) return { score: 6, reason: `${count} proposals - competitive` };
  if (count <= 35) return { score: 4, reason: `${count} proposals - high competition` };
  return { score: 2, reason: `${count}+ proposals - very high competition` };
}

function scoreCaseStudyRelevance(
  job: JobData,
  caseStudies: CaseStudyData[],
): { score: number; reason: string; matchingStudies: string[] } {
  const text = `${lower(job.title)} ${lower(job.description)} ${(job.skills ?? []).map((s) => lower(s)).join(' ')}`;
  const matchingStudies: string[] = [];
  let bestOverlap = 0;

  for (const cs of caseStudies) {
    const csTechs = (cs.technologies ?? []).map((t) => lower(t));
    const csTags = (cs.tags ?? []).map((t) => lower(t));
    const csText = `${lower(cs.problem ?? '')} ${lower(cs.solution ?? '')}`;
    const allTerms = [...csTechs, ...csTags];

    let overlap = 0;
    for (const term of allTerms) {
      if (text.includes(term)) overlap++;
    }
    // Check if problem/solution themes match
    const themeWords = csText.split(/\s+/).filter((w) => w.length > 4);
    for (const w of themeWords) {
      if (text.includes(w)) overlap += 0.3;
    }

    if (overlap >= 2) {
      matchingStudies.push(cs.id);
      bestOverlap = Math.max(bestOverlap, overlap);
    }
  }

  if (bestOverlap >= 5)
    return {
      score: 10,
      reason: `Strong case study relevance (${matchingStudies.length} matching)`,
      matchingStudies,
    };
  if (bestOverlap >= 3)
    return {
      score: 8,
      reason: `Good case study relevance (${matchingStudies.length} matching)`,
      matchingStudies,
    };
  if (bestOverlap >= 2)
    return {
      score: 5,
      reason: `Some case study relevance (${matchingStudies.length} matching)`,
      matchingStudies,
    };
  if (matchingStudies.length > 0)
    return { score: 4, reason: `Weak case study relevance`, matchingStudies };
  return { score: 2, reason: 'No directly relevant case study', matchingStudies: [] };
}

// --------------- Flags ---------------

function detectRedFlags(job: JobData, profile: ProfileData): string[] {
  const flags: string[] = [];
  const desc = job.description ?? '';
  const descLower = lower(desc);
  const wordCount = desc.split(/\s+/).length;

  if (wordCount < 30) flags.push('Vague post: very short description');
  if (wordCount < 50 && !/\b(api|backend|endpoint|database|server)\b/i.test(desc))
    flags.push('No technical details in short post');

  const budget = parseBudgetAmount(job);
  if (budget > 0 && budget < 50) flags.push('Unrealistically low budget');

  const avoidMatches = textContainsAny(
    `${job.title} ${desc} ${(job.skills ?? []).join(' ')}`,
    profile.avoidList ?? [],
  );
  if (avoidMatches.length > 0) flags.push(`Matches avoid list: ${avoidMatches.join(', ')}`);

  const skills = job.skills ?? [];
  const profileStacks = (profile.preferredStacks ?? []).map((s) => lower(s));
  const unrelatedSkills = skills.filter(
    (s) => !profileStacks.some((ps) => lower(s).includes(ps) || ps.includes(lower(s))),
  );
  if (unrelatedSkills.length > skills.length * 0.7 && skills.length > 3)
    flags.push('Most required skills are outside preferred stack');

  if (/\b(free|unpaid|volunteer|exposure|for equity)\b/i.test(desc))
    flags.push('Asks for free or unpaid work');

  const broadScope = [
    'fullstack',
    'full-stack',
    'mobile app',
    'ios',
    'android',
    'blockchain',
    'web3',
  ].filter((b) => descLower.includes(b));
  if (broadScope.length >= 3) flags.push('All-in-one project: unrealistically broad scope');

  const proposalCount = parseProposalCount(job.proposal_count);
  if (proposalCount > 50 && wordCount < 100) flags.push('50+ proposals on a generic/vague job');

  if (/\b(guru|rockstar|ninja|superstar|unicorn)\b/i.test(desc))
    flags.push('Spammy wording detected');

  if (!job.payment_verified && (!job.client_hires || job.client_hires === 0)) {
    flags.push('Unverified client with no hiring history');
  }

  return flags;
}

function detectGreenFlags(job: JobData, profile: ProfileData, matchingStudies: string[]): string[] {
  const flags: string[] = [];
  const text = `${job.title} ${job.description} ${(job.skills ?? []).join(' ')}`;
  const textLower = lower(text);

  if (/\b(backend|api|server|endpoint|rest|graphql)\b/i.test(text))
    flags.push('Clear backend/API problem');
  if (/\b(webhook|integration|automat|pipeline|sync)\b/i.test(text))
    flags.push('Webhooks/integrations/automation focus');

  const stackMatches = textContainsAny(text, [
    'Node.js',
    'NestJS',
    'Express',
    'PostgreSQL',
    'Postgres',
    'MongoDB',
    'AWS',
  ]);
  if (stackMatches.length > 0) {
    const unique = [...new Set(stackMatches)];
    flags.push(`Preferred stack mentioned: ${unique.slice(0, 5).join(', ')}`);
  }

  if (/\b(debug|fix|performance|optimize|refactor|existing)\b/i.test(text))
    flags.push('Debugging/improving existing systems');
  if (/\b(crm|hubspot|salesforce|redtail|zoho)\b/i.test(textLower))
    flags.push('CRM integration work');
  if (/\b(deliverable|milestone|requirement|specific|scope)\b/i.test(text))
    flags.push('Clear deliverables defined');

  const budget = parseBudgetAmount(job);
  if (budget >= (profile.minimumBudget ?? 500)) flags.push('Budget meets minimum threshold');

  if (job.payment_verified) flags.push('Client payment verified');

  const hires = job.client_hires ?? 0;
  if (hires > 3) flags.push(`Client has ${hires} past hires`);

  if (matchingStudies.length > 0)
    flags.push(`${matchingStudies.length} relevant case study match(es)`);

  return flags;
}

// --------------- Main Scoring Function ---------------

export function scoreJob(
  job: JobData,
  profile: ProfileData,
  caseStudies: CaseStudyData[],
): JobScore {
  // Calculate dimensions
  const nicheMatch = scoreNicheMatch(job, profile);
  const stackMatch = scoreStackMatch(job, profile);
  const clarity = scoreClarityOfScope(job);
  const clientTrust = scoreClientTrust(job);
  const budgetScore = scoreBudgetReasonableness(job, profile);
  const complexity = scoreComplexityFit(job, profile);
  const competitiveness = scoreCompetitiveness(job);
  const caseStudyRelevance = scoreCaseStudyRelevance(job, caseStudies);

  const dimensions = [
    {
      name: 'Niche Match',
      score: nicheMatch.score,
      maxScore: 10,
      reason: nicheMatch.reason,
      weight: 2,
    },
    {
      name: 'Stack Match',
      score: stackMatch.score,
      maxScore: 10,
      reason: stackMatch.reason,
      weight: 2,
    },
    {
      name: 'Clarity of Scope',
      score: clarity.score,
      maxScore: 10,
      reason: clarity.reason,
      weight: 1.5,
    },
    {
      name: 'Client Trust',
      score: clientTrust.score,
      maxScore: 10,
      reason: clientTrust.reason,
      weight: 1.5,
    },
    {
      name: 'Budget Reasonableness',
      score: budgetScore.score,
      maxScore: 10,
      reason: budgetScore.reason,
      weight: 1,
    },
    {
      name: 'Complexity Fit',
      score: complexity.score,
      maxScore: 10,
      reason: complexity.reason,
      weight: 1,
    },
    {
      name: 'Competitiveness',
      score: competitiveness.score,
      maxScore: 10,
      reason: competitiveness.reason,
      weight: 1,
    },
    {
      name: 'Case Study Relevance',
      score: caseStudyRelevance.score,
      maxScore: 10,
      reason: caseStudyRelevance.reason,
      weight: 1.5,
    },
  ];

  // Weighted average (0-10 scale)
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const weightedSum = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  let baseScore = (weightedSum / totalWeight) * 10; // Scale to 0-100

  // Detect flags
  const redFlags = detectRedFlags(job, profile);
  const greenFlags = detectGreenFlags(job, profile, caseStudyRelevance.matchingStudies);

  // Build reasons list
  const reasons: JobScore['reasons'] = [];

  // Flag adjustments
  const flagAdjustments: Record<string, number> = {
    'Vague post: very short description': -10,
    'Unrealistically low budget': -8,
    'Most required skills are outside preferred stack': -8,
    'Asks for free or unpaid work': -5,
    'No technical details in short post': -7,
    'All-in-one project: unrealistically broad scope': -10,
    '50+ proposals on a generic/vague job': -5,
    'Spammy wording detected': -5,
    'Unverified client with no hiring history': -5,
  };

  for (const flag of redFlags) {
    let adjustment = -5;
    for (const [pattern, val] of Object.entries(flagAdjustments)) {
      if (flag.includes(pattern.split(':')[0])) {
        adjustment = val;
        break;
      }
    }
    baseScore += adjustment;
    reasons.push({ text: flag, impact: 'negative', weight: Math.abs(adjustment) });
  }

  const greenAdjustments: Record<string, number> = {
    'Clear backend/API problem': 8,
    'Webhooks/integrations/automation': 8,
    'Preferred stack mentioned': 5,
    'Debugging/improving existing': 5,
    'CRM integration': 7,
    'Clear deliverables': 5,
    'Budget meets minimum': 5,
    'Client payment verified': 5,
    'past hires': 5,
    'case study match': 8,
  };

  for (const flag of greenFlags) {
    let adjustment = 5;
    for (const [pattern, val] of Object.entries(greenAdjustments)) {
      if (flag.toLowerCase().includes(pattern.toLowerCase())) {
        adjustment = val;
        break;
      }
    }
    baseScore += adjustment;
    reasons.push({ text: flag, impact: 'positive', weight: adjustment });
  }

  // Add dimension-based reasons
  for (const dim of dimensions) {
    const impact: 'positive' | 'negative' | 'neutral' =
      dim.score >= 7 ? 'positive' : dim.score <= 3 ? 'negative' : 'neutral';
    reasons.push({ text: `${dim.name}: ${dim.reason}`, impact, weight: dim.weight });
  }

  // Clamp to 0-100
  const total = Math.max(0, Math.min(100, Math.round(baseScore)));

  // Determine label
  let label: JobScore['label'];
  if (total >= 70) label = 'Strong Fit';
  else if (total >= 41) label = 'Possible Fit';
  else label = 'Skip';

  return {
    total,
    label,
    reasons,
    redFlags,
    greenFlags,
    dimensions: dimensions.map(({ name, score, maxScore, reason }) => ({
      name,
      score,
      maxScore,
      reason,
    })),
  };
}
