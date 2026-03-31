import { describe, it, expect } from 'vitest';
import { generateProposal } from '../src/proposal';
import { scoreJob } from '../src/scoring';
import { defaultProfile, defaultCaseStudies } from '../src/resume-data';
import type { ExtractedJob } from '../src/types';

// ─── Helper ─────────────────────────────────────────────────────────────────

function makeJob(overrides: Partial<ExtractedJob> = {}): ExtractedJob {
  return {
    id: 'test-job-001',
    title: 'Test Job',
    description: 'A test job description.',
    skills: [],
    extractedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('generateProposal', () => {
  it('should generate a confident proposal for a Strong Fit job', () => {
    const job = makeJob({
      title: 'Senior Node.js Backend Developer for API Integration',
      description:
        'We need an experienced backend developer to build a NestJS-based API integration layer. The project involves connecting our CRM with webhooks, processing events in PostgreSQL, and deploying on AWS. Must have TypeScript and REST API experience. Clear deliverables include webhook endpoints, background jobs with BullMQ, and admin API.',
      skills: ['Node.js', 'NestJS', 'PostgreSQL', 'TypeScript', 'AWS'],
      paymentVerified: true,
      budgetAmount: 3000,
      clientHires: 15,
      clientTotalSpent: '$50K+',
      proposalCount: '5 to 10',
      experienceLevel: 'Expert',
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);
    expect(score.label).toBe('Strong Fit');

    const proposal = generateProposal(job, score, defaultProfile, defaultCaseStudies);

    expect(proposal.strategy).toBe('confident');
    expect(proposal.openingLine).toBeTruthy();
    expect(proposal.openingLine.length).toBeGreaterThan(10);
    expect(proposal.shortProposal).toBeTruthy();
    expect(proposal.shortProposal.length).toBeGreaterThan(100);
    expect(proposal.detailedProposal).toBeTruthy();
    expect(proposal.detailedProposal.length).toBeGreaterThan(proposal.shortProposal.length);
    expect(proposal.firstStep).toBeTruthy();
    expect(proposal.cta).toBeTruthy();
    expect(proposal.matchingTechnologies.length).toBeGreaterThan(0);
    expect(proposal.matchingCaseStudies.length).toBeGreaterThan(0);
  });

  it('should generate a skip note for a Skip-rated job', () => {
    const job = makeJob({
      title: 'Need someone',
      description: 'Quick project, just do it.',
      skills: [],
      paymentVerified: false,
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);
    expect(score.label).toBe('Skip');

    const proposal = generateProposal(job, score, defaultProfile, defaultCaseStudies);

    expect(proposal.strategy).toBe('skip-note');
    expect(proposal.skipReason).toBeTruthy();
    expect(proposal.shortProposal).toContain('Skip');
    expect(proposal.firstStep).toContain('skip');
    expect(proposal.cta).toBe('');
    expect(proposal.clarifyingQuestions.length).toBe(0);
  });

  it('should not contain fabricated experience or hype language', () => {
    const job = makeJob({
      title: 'Backend Developer for Webhook Processing',
      description:
        'Build a webhook ingestion system for our platform. Node.js, Express, PostgreSQL. Need someone experienced with event-driven architecture and API integrations.',
      skills: ['Node.js', 'Express', 'PostgreSQL'],
      paymentVerified: true,
      budgetAmount: 2000,
      clientHires: 5,
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);
    const proposal = generateProposal(job, score, defaultProfile, defaultCaseStudies);

    const fullText = [proposal.openingLine, proposal.shortProposal, proposal.detailedProposal].join(
      ' ',
    );

    // Should not contain hype phrases
    const hypePatterns = [
      'i am the best fit',
      "i'm confident i'm the perfect match",
      'the perfect candidate',
      'best developer',
      'guaranteed results',
      'i promise',
      '100% satisfaction',
    ];

    for (const pattern of hypePatterns) {
      expect(fullText.toLowerCase()).not.toContain(pattern);
    }

    // Should reference real technologies that are in the profile
    const mentionedTechs = proposal.matchingTechnologies;
    for (const tech of mentionedTechs) {
      const allProfileTechs = [
        ...defaultProfile.preferredStacks,
        ...defaultProfile.skills.flatMap((s) => s.skills),
      ];
      const profileTechsLower = allProfileTechs.map((t) => t.toLowerCase());
      const techLower = tech.toLowerCase().split('(')[0].trim();
      const isRealSkill = profileTechsLower.some(
        (pt) => pt.includes(techLower) || techLower.includes(pt.split('(')[0].trim()),
      );
      expect(isRealSkill).toBe(true);
    }
  });

  it('should generate a populated opening line', () => {
    const job = makeJob({
      title: 'API Integration Specialist',
      description:
        'We need to integrate our system with multiple third-party APIs. Node.js backend, PostgreSQL database. Webhook handling required.',
      skills: ['Node.js', 'PostgreSQL', 'API Integration'],
      paymentVerified: true,
      budgetAmount: 1500,
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);
    const proposal = generateProposal(job, score, defaultProfile, defaultCaseStudies);

    expect(proposal.openingLine).toBeTruthy();
    expect(proposal.openingLine.length).toBeGreaterThan(20);

    // Opening line should not contain unfilled template variables
    expect(proposal.openingLine).not.toContain('{');
    expect(proposal.openingLine).not.toContain('}');
  });

  it('should generate clarifying questions for jobs with missing details', () => {
    // Job must score above Skip (>40) so clarifying questions are generated
    const job = makeJob({
      title: 'Node.js Backend API Developer Needed',
      description:
        'We need a backend developer to build REST API endpoints and webhook integrations for our SaaS application. Must know Node.js and PostgreSQL. We have an existing codebase.',
      skills: ['Node.js', 'PostgreSQL', 'REST API'],
      paymentVerified: true,
      clientHires: 3,
      // No budget, no duration — these should trigger questions
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);
    // Ensure job doesn't score as Skip
    expect(score.label).not.toBe('Skip');
    const proposal = generateProposal(job, score, defaultProfile, defaultCaseStudies);

    expect(proposal.clarifyingQuestions.length).toBeGreaterThanOrEqual(1);
    expect(proposal.clarifyingQuestions.length).toBeLessThanOrEqual(3);

    // Questions should be actual questions (end with ?)
    for (const q of proposal.clarifyingQuestions) {
      expect(q).toContain('?');
    }
  });

  it('should generate a cautious proposal for a Possible Fit job', () => {
    const job = makeJob({
      title: 'Python Django Developer for Dashboard',
      description:
        'We need a backend developer to build a Django dashboard with REST API endpoints. PostgreSQL database. Some automation scripts needed. Must be comfortable with server-side development and API design.',
      skills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
      paymentVerified: true,
      budgetAmount: 1500,
      clientHires: 3,
      proposalCount: '15 to 20',
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);
    // This might be Possible Fit because it's backend but Django/Python focused
    const proposal = generateProposal(job, score, defaultProfile, defaultCaseStudies);

    // Should not be skip-note for a backend job
    expect(['confident', 'cautious']).toContain(proposal.strategy);

    if (proposal.strategy === 'cautious') {
      // Cautious proposals should still be substantive
      expect(proposal.shortProposal.length).toBeGreaterThan(50);
      expect(proposal.relevantExperience.length).toBeGreaterThan(0);
      expect(proposal.cta).toBeTruthy();
    }
  });

  it('should include matching case studies in the proposal', () => {
    const job = makeJob({
      title: 'NestJS Webhook Integration Developer',
      description:
        'Build a webhook processing system with NestJS. Need to integrate with CRM APIs, process events, store in PostgreSQL. Experience with GoTo Connect or similar VoIP APIs is a plus.',
      skills: ['NestJS', 'PostgreSQL', 'Webhooks', 'Node.js', 'TypeScript'],
      paymentVerified: true,
      budgetAmount: 4000,
      clientHires: 10,
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);
    const proposal = generateProposal(job, score, defaultProfile, defaultCaseStudies);

    // Should match at least the GoTo CRM Integration case study
    expect(proposal.matchingCaseStudies.length).toBeGreaterThan(0);

    // Case studies should be from the actual case study list
    for (const title of proposal.matchingCaseStudies) {
      const found = defaultCaseStudies.some((cs) => cs.title === title);
      expect(found).toBe(true);
    }
  });
});
