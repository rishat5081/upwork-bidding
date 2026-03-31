import type {
  ExtractedJob,
  UserProfile,
  CaseStudy,
  JobScore,
  ScoreReason,
  ScoreDimension,
} from './types';

// ─── Keyword banks ──────────────────────────────────────────────────────────

const NICHE_KEYWORDS = [
  'backend',
  'api',
  'integration',
  'webhook',
  'automation',
  'saas',
  'microservice',
  'server-side',
  'rest api',
  'graphql',
  'database',
  'pipeline',
  'cron',
  'queue',
  'worker',
  'etl',
  'data sync',
  'middleware',
  'endpoint',
  'crud',
  'authentication',
  'authorization',
  'oauth',
  'jwt',
  'socket',
  'real-time',
  'event-driven',
  'message queue',
  'background job',
  'scheduler',
  'scraper',
  'crawler',
  'devops',
  'ci/cd',
  'deployment',
  'infrastructure',
  'cloud',
  'serverless',
  'lambda',
];

const VAGUE_INDICATORS = ['guru', 'rockstar', 'ninja', 'superstar', 'wizard', 'unicorn'];

const UNREALISTIC_COMBO_KEYWORDS = [
  'blockchain',
  'web3',
  'nft',
  'mobile app',
  'ios',
  'android',
  'flutter',
  'react native',
  'ui/ux design',
  'graphic design',
  'video editing',
  'seo',
  'marketing',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function lower(text: string | undefined): string {
  return (text ?? '').toLowerCase();
}

function combinedText(job: ExtractedJob): string {
  return lower(job.title) + ' ' + lower(job.description);
}

function countKeywordMatches(text: string, keywords: string[]): number {
  let count = 0;
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) {
      count++;
    }
  }
  return count;
}

function parseProposalCount(proposalCount?: string): number | null {
  if (!proposalCount) return null;
  const match = proposalCount.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  // Handle ranges like "10 to 15"
  const rangeMatch = proposalCount.match(/(\d+)\s*to\s*(\d+)/i);
  if (rangeMatch) return parseInt(rangeMatch[2], 10);
  return null;
}

function parseClientSpent(totalSpent?: string): number | null {
  if (!totalSpent) return null;
  const cleaned = totalSpent.replace(/[^0-9.kKmM]/g, '');
  const kMatch = cleaned.match(/([\d.]+)\s*[kK]/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const mMatch = cleaned.match(/([\d.]+)\s*[mM]/);
  if (mMatch) return parseFloat(mMatch[1]) * 1000000;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseHireRate(hireRate?: string): number | null {
  if (!hireRate) return null;
  const match = hireRate.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Dimension scorers ──────────────────────────────────────────────────────

function scoreNicheMatch(job: ExtractedJob, profile: UserProfile): ScoreDimension {
  const text = combinedText(job);
  const nicheTerms = profile.niche
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);
  const allKeywords = [...NICHE_KEYWORDS, ...nicheTerms];
  const matches = countKeywordMatches(text, allKeywords);

  // Check preferred job types
  const jobTypeMatches = profile.preferredJobTypes.filter((jt) =>
    text.includes(jt.toLowerCase()),
  ).length;

  const rawScore = Math.min(matches * 1.2 + jobTypeMatches * 1.5, 10);
  const score = Math.round(clamp(rawScore, 0, 10) * 10) / 10;

  let reason: string;
  if (score >= 7)
    reason = `Strong niche alignment: ${matches} backend/API/integration keywords found.`;
  else if (score >= 4) reason = `Partial niche match: ${matches} relevant keywords found.`;
  else reason = `Weak niche match: only ${matches} relevant keywords found.`;

  return { name: 'Niche Match', score, maxScore: 10, reason };
}

function scoreStackMatch(job: ExtractedJob, profile: UserProfile): ScoreDimension {
  const text = combinedText(job);
  const jobSkillsLower = job.skills.map((s) => s.toLowerCase());

  const matchedStacks: string[] = [];
  for (const stack of profile.preferredStacks) {
    const stackLower = stack.toLowerCase();
    if (text.includes(stackLower) || jobSkillsLower.includes(stackLower)) {
      matchedStacks.push(stack);
    }
  }

  // Also check all skills from skill categories
  let deepSkillMatches = 0;
  for (const cat of profile.skills) {
    for (const skill of cat.skills) {
      const skillLower = skill.toLowerCase();
      // Handle compound skills like "AWS (EC2, S3, ...)"
      const baseSkill = skillLower.split('(')[0].trim();
      if (
        text.includes(baseSkill) ||
        jobSkillsLower.some((js) => js.includes(baseSkill) || baseSkill.includes(js))
      ) {
        deepSkillMatches++;
      }
    }
  }

  const primaryMatches = matchedStacks.length;
  const rawScore = Math.min(primaryMatches * 2.0 + deepSkillMatches * 0.5, 10);
  const score = Math.round(clamp(rawScore, 0, 10) * 10) / 10;

  let reason: string;
  if (matchedStacks.length > 0) {
    reason = `Matching stacks: ${matchedStacks.join(', ')}. ${deepSkillMatches} additional skill overlaps.`;
  } else if (deepSkillMatches > 0) {
    reason = `No primary stack match but ${deepSkillMatches} related skill overlaps found.`;
  } else {
    reason = 'No matching technologies found in job requirements.';
  }

  return { name: 'Stack Match', score, maxScore: 10, reason };
}

function scoreClarityOfScope(job: ExtractedJob): ScoreDimension {
  const desc = job.description ?? '';
  const descLength = desc.length;
  let score = 0;

  // Length scoring
  if (descLength > 1000) score += 3;
  else if (descLength > 500) score += 2;
  else if (descLength > 200) score += 1;

  // Technical details
  const technicalTerms = [
    'api',
    'endpoint',
    'database',
    'webhook',
    'integration',
    'deploy',
    'server',
    'query',
    'schema',
    'migration',
    'docker',
    'aws',
    'authentication',
    'authorization',
    'cron',
    'queue',
    'socket',
    'rest',
    'graphql',
    'sql',
    'nosql',
    'redis',
    'cache',
  ];
  const techCount = countKeywordMatches(lower(desc), technicalTerms);
  if (techCount >= 5) score += 3;
  else if (techCount >= 3) score += 2;
  else if (techCount >= 1) score += 1;

  // Specific deliverables or requirements
  const deliverableIndicators = [
    'deliverable',
    'milestone',
    'requirement',
    'must have',
    'should have',
    'need to',
    'looking for',
    'scope',
    'feature',
    'functionality',
    'expected',
  ];
  const delivCount = countKeywordMatches(lower(desc), deliverableIndicators);
  if (delivCount >= 3) score += 2;
  else if (delivCount >= 1) score += 1;

  // Screening questions are a good sign
  if (job.screeningQuestions && job.screeningQuestions.length > 0) score += 1;

  // Experience level specified
  if (job.experienceLevel) score += 1;

  score = clamp(score, 0, 10);

  let reason: string;
  if (score >= 7)
    reason = `Well-defined scope: ${descLength} chars, ${techCount} technical terms, clear requirements.`;
  else if (score >= 4)
    reason = `Moderate clarity: ${descLength} chars, ${techCount} technical terms.`;
  else reason = `Vague scope: only ${descLength} chars and ${techCount} technical terms.`;

  return { name: 'Clarity of Scope', score, maxScore: 10, reason };
}

function scoreClientTrust(job: ExtractedJob): ScoreDimension {
  let score = 0;

  if (job.paymentVerified) score += 3;

  const hires = job.clientHires ?? 0;
  if (hires > 10) score += 3;
  else if (hires > 3) score += 2;
  else if (hires > 0) score += 1;

  const spent = parseClientSpent(job.clientTotalSpent);
  if (spent !== null) {
    if (spent > 50000) score += 2;
    else if (spent > 10000) score += 1.5;
    else if (spent > 1000) score += 1;
  }

  const hireRate = parseHireRate(job.clientHireRate);
  if (hireRate !== null) {
    if (hireRate >= 70) score += 2;
    else if (hireRate >= 40) score += 1;
  }

  score = clamp(Math.round(score * 10) / 10, 0, 10);

  const parts: string[] = [];
  if (job.paymentVerified) parts.push('Payment verified');
  if (hires > 0) parts.push(`${hires} past hires`);
  if (spent !== null) parts.push(`$${spent.toLocaleString()} spent`);
  if (hireRate !== null) parts.push(`${hireRate}% hire rate`);

  const reason =
    parts.length > 0
      ? `Client signals: ${parts.join(', ')}.`
      : 'No client trust signals available.';

  return { name: 'Client Trust Signals', score, maxScore: 10, reason };
}

function scoreBudgetReasonableness(job: ExtractedJob, profile: UserProfile): ScoreDimension {
  let score = 5; // Default neutral

  if (job.budgetAmount != null) {
    if (job.budgetAmount >= profile.minimumBudget * 2) score = 9;
    else if (job.budgetAmount >= profile.minimumBudget) score = 7;
    else if (job.budgetAmount >= profile.minimumBudget * 0.5) score = 4;
    else score = 2;
  } else if (job.budget) {
    // Has a budget string but no parsed amount
    score = 5;
  } else if (job.hourlyRange) {
    // Hourly - check if reasonable
    const match = job.hourlyRange.match(/\$?(\d+)/);
    if (match) {
      const rate = parseInt(match[1], 10);
      if (rate >= 50) score = 8;
      else if (rate >= 30) score = 6;
      else score = 3;
    }
  } else {
    // No budget info at all
    score = 3;
  }

  score = clamp(score, 0, 10);

  let reason: string;
  if (job.budgetAmount != null) {
    reason = `Budget: $${job.budgetAmount}. Minimum threshold: $${profile.minimumBudget}.`;
  } else if (job.hourlyRange) {
    reason = `Hourly range: ${job.hourlyRange}.`;
  } else if (job.budget) {
    reason = `Budget listed: ${job.budget}.`;
  } else {
    reason = 'No budget information provided.';
  }

  return { name: 'Budget Reasonableness', score, maxScore: 10, reason };
}

function scoreComplexityFit(job: ExtractedJob, _profile: UserProfile): ScoreDimension {
  const text = combinedText(job);
  let score = 6; // Default moderate

  // Too simple indicators
  const simpleIndicators = [
    'simple landing page',
    'basic website',
    'wordpress site',
    'shopify theme',
    'html page',
    'simple form',
    'basic crud',
  ];
  const simpleCount = countKeywordMatches(text, simpleIndicators);
  if (simpleCount > 0) score -= 3;

  // Good complexity indicators (matches senior backend work)
  const goodComplexity = [
    'architecture',
    'scalable',
    'microservice',
    'multi-tenant',
    'pipeline',
    'distributed',
    'migration',
    'optimization',
    'performance',
    'refactor',
    'legacy',
    'enterprise',
    'production',
    'high availability',
    'load balancing',
  ];
  const goodCount = countKeywordMatches(text, goodComplexity);
  if (goodCount >= 3) score += 3;
  else if (goodCount >= 1) score += 1;

  // Unrealistic scope indicators
  const unrealisticCount = countKeywordMatches(text, UNREALISTIC_COMBO_KEYWORDS);
  if (unrealisticCount >= 4) score -= 3;

  // Check experience level alignment
  if (job.experienceLevel) {
    const level = lower(job.experienceLevel);
    if (level.includes('expert') || level.includes('senior')) score += 1;
    else if (level.includes('intermediate')) score += 0;
    else if (level.includes('entry') || level.includes('beginner')) score -= 2;
  }

  score = clamp(Math.round(score * 10) / 10, 0, 10);

  let reason: string;
  if (score >= 7)
    reason = `Complexity matches senior backend expertise. ${goodCount} complexity indicators found.`;
  else if (score >= 4)
    reason = `Moderate complexity fit. ${goodCount} complexity indicators, ${simpleCount} simplicity markers.`;
  else
    reason = `Poor complexity fit: ${simpleCount > 0 ? 'too simple for skill level' : 'unrealistic scope or mismatch'}.`;

  return { name: 'Complexity Fit', score, maxScore: 10, reason };
}

function scoreProposalCompetitiveness(job: ExtractedJob): ScoreDimension {
  const proposalNum = parseProposalCount(job.proposalCount);
  let score: number;

  if (proposalNum === null) {
    score = 5; // Unknown
  } else if (proposalNum <= 5) {
    score = 10;
  } else if (proposalNum <= 10) {
    score = 8;
  } else if (proposalNum <= 20) {
    score = 6;
  } else if (proposalNum <= 35) {
    score = 4;
  } else if (proposalNum <= 50) {
    score = 2;
  } else {
    score = 1;
  }

  const reason =
    proposalNum !== null
      ? `${proposalNum} proposals submitted. ${proposalNum <= 10 ? 'Low competition.' : proposalNum <= 30 ? 'Moderate competition.' : 'High competition.'}`
      : 'Proposal count not available.';

  return {
    name: 'Proposal Competitiveness',
    score,
    maxScore: 10,
    reason,
  };
}

function scoreCaseStudyRelevance(job: ExtractedJob, caseStudies: CaseStudy[]): ScoreDimension {
  const text = combinedText(job);
  const jobSkillsLower = job.skills.map((s) => s.toLowerCase());

  let bestMatch = 0;
  let bestTitle = '';

  for (const cs of caseStudies) {
    let matchScore = 0;

    // Check technology overlap
    for (const tech of cs.technologies) {
      const techLower = tech.toLowerCase();
      if (text.includes(techLower) || jobSkillsLower.includes(techLower)) {
        matchScore += 2;
      }
    }

    // Check tag overlap
    for (const tag of cs.tags) {
      if (text.includes(tag.toLowerCase())) {
        matchScore += 1.5;
      }
    }

    // Check if case study problem domain matches
    const csProblemWords = lower(cs.problem).split(/\s+/);
    const csKeyWords = csProblemWords.filter((w) => w.length > 5);
    for (const word of csKeyWords) {
      if (text.includes(word)) matchScore += 0.3;
    }

    if (matchScore > bestMatch) {
      bestMatch = matchScore;
      bestTitle = cs.title;
    }
  }

  const score = clamp(Math.round(Math.min(bestMatch, 10) * 10) / 10, 0, 10);

  let reason: string;
  if (score >= 7) reason = `Strong case study match: "${bestTitle}" directly relevant.`;
  else if (score >= 4) reason = `Partial case study match: "${bestTitle}" has some overlap.`;
  else if (bestTitle) reason = `Weak case study relevance. Best partial match: "${bestTitle}".`;
  else reason = 'No relevant case studies found.';

  return { name: 'Case Study Relevance', score, maxScore: 10, reason };
}

// ─── Flag detection ─────────────────────────────────────────────────────────

function detectRedFlags(
  job: ExtractedJob,
  profile: UserProfile,
): { flags: string[]; penalty: number } {
  const text = combinedText(job);
  const flags: string[] = [];
  let penalty = 0;

  // Vague job post
  const descLength = (job.description ?? '').length;
  if (descLength < 100) {
    flags.push('Vague job post: very short description with no technical details.');
    penalty += 10;
  }

  // Unrealistic budget
  if (
    job.budgetAmount != null &&
    job.budgetAmount < profile.minimumBudget * 0.3 &&
    descLength > 200
  ) {
    flags.push(
      `Unrealistic budget: $${job.budgetAmount} for described scope (minimum is $${profile.minimumBudget}).`,
    );
    penalty += 8;
  }

  // Too many unrelated skills
  const unrealisticSkillCount = countKeywordMatches(text, UNREALISTIC_COMBO_KEYWORDS);
  if (unrealisticSkillCount >= 4) {
    flags.push(
      'Too many unrelated skills: job asks for backend + mobile + design + other unrelated domains.',
    );
    penalty += 8;
  }

  // Likely free consulting
  const freeConsultingIndicators = [
    'architecture review',
    'audit my code',
    'review my system',
    'give me a plan',
    'propose a solution',
    'tell me how',
    'consulting call',
  ];
  const freeConsultCount = countKeywordMatches(text, freeConsultingIndicators);
  if (freeConsultCount > 0 && (!job.budgetAmount || job.budgetAmount < 100)) {
    flags.push(
      'Likely free consulting: asking for architecture plan or audit with no clear paid engagement.',
    );
    penalty += 5;
  }

  // No technical detail at all
  const technicalTerms = [
    'api',
    'database',
    'server',
    'code',
    'develop',
    'build',
    'software',
    'application',
    'system',
    'backend',
    'frontend',
    'deploy',
    'test',
    'debug',
    'fix',
    'integrate',
  ];
  const techCount = countKeywordMatches(text, technicalTerms);
  if (techCount === 0 && descLength > 50) {
    flags.push('No technical detail: job description lacks any software development terms.');
    penalty += 7;
  }

  // Full-stack/mobile/AI/blockchain all-in-one
  const allInOneKeywords = ['blockchain', 'web3', 'nft'];
  const mobileKeywords = ['mobile app', 'ios app', 'android app', 'flutter', 'react native'];
  const hasBlockchain = countKeywordMatches(text, allInOneKeywords) > 0;
  const hasMobile = countKeywordMatches(text, mobileKeywords) > 0;
  const hasBackend = countKeywordMatches(text, ['backend', 'api', 'server']) > 0;
  if (hasBlockchain && hasMobile && hasBackend) {
    flags.push(
      'Full-stack/mobile/AI/blockchain all-in-one: unrealistic scope combining too many domains.',
    );
    penalty += 10;
  }

  // Too many proposals on generic job
  const proposalNum = parseProposalCount(job.proposalCount);
  if (proposalNum !== null && proposalNum >= 50 && techCount < 3) {
    flags.push(`Too many proposals (${proposalNum}) on a generic-looking job.`);
    penalty += 5;
  }

  // Spammy/low-signal wording
  const vagueCount = countKeywordMatches(text, VAGUE_INDICATORS);
  const exclamationCount = (text.match(/!/g) ?? []).length;
  if (vagueCount > 0 || exclamationCount > 5) {
    const reasons: string[] = [];
    if (vagueCount > 0)
      reasons.push(`uses hype words like "${VAGUE_INDICATORS.find((v) => text.includes(v))}"`);
    if (exclamationCount > 5) reasons.push(`${exclamationCount} exclamation marks`);
    flags.push(`Low-signal wording: ${reasons.join(', ')}.`);
    penalty += 5;
  }

  // Client has no hires, no spent, unverified
  if (
    !job.paymentVerified &&
    (!job.clientHires || job.clientHires === 0) &&
    !job.clientTotalSpent
  ) {
    flags.push('Untrusted client: no payment verification, no hire history, no spending record.');
    penalty += 5;
  }

  // Avoid list check
  for (const avoid of profile.avoidList) {
    if (text.includes(avoid.toLowerCase())) {
      flags.push(`Matches avoid list item: "${avoid}".`);
      penalty += 8;
      break; // Only penalize once for avoid list
    }
  }

  return { flags, penalty };
}

function detectGreenFlags(
  job: ExtractedJob,
  profile: UserProfile,
  caseStudies: CaseStudy[],
): { flags: string[]; bonus: number } {
  const text = combinedText(job);
  const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
  const flags: string[] = [];
  let bonus = 0;

  // Clear backend/API problem
  const backendTerms = ['backend', 'api', 'server-side', 'server side', 'back-end', 'back end'];
  if (countKeywordMatches(text, backendTerms) > 0) {
    flags.push('Clear backend/API problem identified.');
    bonus += 8;
  }

  // Webhooks/integrations/automation
  const integrationTerms = ['webhook', 'integration', 'automation', 'automate', 'pipeline', 'sync'];
  if (countKeywordMatches(text, integrationTerms) > 0) {
    flags.push('Involves webhooks, integrations, or automation.');
    bonus += 8;
  }

  // Specific stack mentions
  const highValueStacks = [
    'node.js',
    'nodejs',
    'node',
    'nestjs',
    'nest.js',
    'express',
    'express.js',
    'expressjs',
    'postgres',
    'postgresql',
    'mongodb',
    'mongo',
    'aws',
  ];
  let stackMatchCount = 0;
  const matchedStackNames: string[] = [];
  for (const stack of highValueStacks) {
    if (text.includes(stack) || jobSkillsLower.some((s) => s.includes(stack))) {
      stackMatchCount++;
      matchedStackNames.push(stack);
    }
  }
  if (stackMatchCount > 0) {
    const stackBonus = Math.min(stackMatchCount * 5, 15);
    flags.push(`Mentions preferred technologies: ${matchedStackNames.slice(0, 5).join(', ')}.`);
    bonus += stackBonus;
  }

  // Debugging existing systems
  const debugTerms = [
    'debug',
    'fix bug',
    'troubleshoot',
    'optimize',
    'performance issue',
    'existing system',
    'existing code',
    'existing app',
  ];
  if (countKeywordMatches(text, debugTerms) > 0) {
    flags.push('Involves debugging or optimizing existing systems.');
    bonus += 5;
  }

  // CRM integrations
  const crmTerms = ['crm', 'salesforce', 'hubspot', 'redtail', 'pipedrive', 'zoho crm'];
  if (countKeywordMatches(text, crmTerms) > 0) {
    flags.push('Involves CRM integration work.');
    bonus += 7;
  }

  // Clear deliverable
  const deliverableTerms = [
    'deliverable',
    'milestone',
    'specific feature',
    'must deliver',
    'end result',
    'expected output',
  ];
  if (countKeywordMatches(text, deliverableTerms) > 0) {
    flags.push('Has clear deliverables defined.');
    bonus += 5;
  }

  // Reasonable budget
  if (job.budgetAmount != null && job.budgetAmount >= profile.minimumBudget) {
    flags.push(`Reasonable budget: $${job.budgetAmount}.`);
    bonus += 5;
  }

  // Payment verified
  if (job.paymentVerified) {
    flags.push('Client payment method verified.');
    bonus += 5;
  }

  // Past hires
  if (job.clientHires && job.clientHires > 0) {
    flags.push(`Client has ${job.clientHires} past hires.`);
    bonus += 5;
  }

  // Similar to past work (check case studies)
  for (const cs of caseStudies) {
    let overlap = 0;
    for (const tech of cs.technologies) {
      if (text.includes(tech.toLowerCase())) overlap++;
    }
    for (const tag of cs.tags) {
      if (text.includes(tag.toLowerCase())) overlap++;
    }
    if (overlap >= 4) {
      flags.push(`Similar to past work: "${cs.title}".`);
      bonus += 8;
      break; // Only count once
    }
  }

  return { flags, bonus };
}

// ─── Main scoring function ──────────────────────────────────────────────────

export function scoreJob(
  job: ExtractedJob,
  profile: UserProfile,
  caseStudies: CaseStudy[],
): JobScore {
  // Calculate all dimensions
  const dimensions: ScoreDimension[] = [
    scoreNicheMatch(job, profile),
    scoreStackMatch(job, profile),
    scoreClarityOfScope(job),
    scoreClientTrust(job),
    scoreBudgetReasonableness(job, profile),
    scoreComplexityFit(job, profile),
    scoreProposalCompetitiveness(job),
    scoreCaseStudyRelevance(job, caseStudies),
  ];

  // Dimension weights
  const weights: Record<string, number> = {
    'Niche Match': 2,
    'Stack Match': 2,
    'Clarity of Scope': 1.5,
    'Client Trust Signals': 1.5,
    'Budget Reasonableness': 1,
    'Complexity Fit': 1,
    'Proposal Competitiveness': 1,
    'Case Study Relevance': 1.5,
  };

  // Weighted average of dimensions (scaled to 0-100)
  let weightedSum = 0;
  let totalWeight = 0;
  for (const dim of dimensions) {
    const w = weights[dim.name] ?? 1;
    weightedSum += (dim.score / dim.maxScore) * w;
    totalWeight += w;
  }
  const dimensionScore = (weightedSum / totalWeight) * 100;

  // Detect flags
  const { flags: redFlags, penalty } = detectRedFlags(job, profile);
  const { flags: greenFlags, bonus } = detectGreenFlags(job, profile, caseStudies);

  // Calculate total
  const total = clamp(Math.round(dimensionScore + bonus - penalty), 0, 100);

  // Determine label
  let label: JobScore['label'];
  if (total >= 70) label = 'Strong Fit';
  else if (total >= 41) label = 'Possible Fit';
  else label = 'Skip';

  // Build reasons
  const reasons: ScoreReason[] = [];

  for (const flag of greenFlags) {
    reasons.push({ text: flag, impact: 'positive', weight: 1 });
  }
  for (const flag of redFlags) {
    reasons.push({ text: flag, impact: 'negative', weight: 1 });
  }
  for (const dim of dimensions) {
    const impact: ScoreReason['impact'] =
      dim.score >= 7 ? 'positive' : dim.score <= 3 ? 'negative' : 'neutral';
    reasons.push({
      text: `${dim.name}: ${dim.score}/${dim.maxScore} -- ${dim.reason}`,
      impact,
      weight: weights[dim.name] ?? 1,
    });
  }

  return {
    total,
    label,
    reasons,
    redFlags,
    greenFlags,
    dimensions,
  };
}
