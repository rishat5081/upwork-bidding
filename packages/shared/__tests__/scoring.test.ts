import { describe, it, expect } from 'vitest';
import { scoreJob } from '../src/scoring';
import { defaultProfile, defaultCaseStudies } from '../src/resume-data';
import type { ExtractedJob } from '../src/types';

// ─── Helper to create a base job ────────────────────────────────────────────

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

describe('scoreJob', () => {
  it('should score a clearly matching backend/API job as Strong Fit', () => {
    const job = makeJob({
      title: 'Senior Node.js Backend Developer for API Integration',
      description:
        'We need an experienced backend developer to build a NestJS-based API integration layer. The project involves connecting our CRM system with third-party webhooks, processing events, and storing data in PostgreSQL. Must have experience with TypeScript, REST APIs, and AWS deployment. We have an existing codebase and need someone to extend it with new webhook endpoints and background job processing using BullMQ and Redis. Clear deliverables: 1) Webhook ingestion service 2) CRM sync pipeline 3) Admin dashboard API endpoints. Budget is $3,000 for the initial phase.',
      skills: ['Node.js', 'NestJS', 'PostgreSQL', 'TypeScript', 'AWS', 'REST API'],
      paymentVerified: true,
      budgetAmount: 3000,
      jobType: 'fixed',
      clientHires: 15,
      clientTotalSpent: '$50K+',
      clientHireRate: '80%',
      proposalCount: '5 to 10',
      experienceLevel: 'Expert',
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    expect(score.label).toBe('Strong Fit');
    expect(score.total).toBeGreaterThanOrEqual(70);
    expect(score.greenFlags.length).toBeGreaterThan(0);
    expect(score.dimensions.length).toBe(8);

    // Should have positive reasons
    const positiveReasons = score.reasons.filter((r) => r.impact === 'positive');
    expect(positiveReasons.length).toBeGreaterThan(0);
  });

  it('should score a vague generic job as Skip', () => {
    const job = makeJob({
      title: 'Need a developer',
      description: 'Looking for someone to help with a project. Must be good.',
      skills: [],
      paymentVerified: false,
      proposalCount: '50+',
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    expect(score.label).toBe('Skip');
    expect(score.total).toBeLessThan(41);
    expect(score.redFlags.length).toBeGreaterThan(0);
  });

  it('should detect red flags and reduce score', () => {
    const job = makeJob({
      title: 'Need a rockstar ninja guru developer!!!',
      description:
        'We need a guru who can build us a blockchain mobile app with ios android flutter react native backend api design and video editing!!! Looking for a ninja to do it all!!!',
      skills: ['Blockchain', 'React Native', 'Flutter', 'iOS', 'Android', 'Node.js'],
      budgetAmount: 50,
      paymentVerified: false,
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    expect(score.redFlags.length).toBeGreaterThan(0);
    expect(score.total).toBeLessThan(50);

    // Should detect spammy wording
    const hasSpamFlag = score.redFlags.some(
      (f) => f.toLowerCase().includes('low-signal') || f.toLowerCase().includes('wording'),
    );
    expect(hasSpamFlag).toBe(true);
  });

  it('should detect green flags and increase score', () => {
    const job = makeJob({
      title: 'Node.js API Integration with CRM',
      description:
        'Need to integrate our backend API with a CRM system. Webhook processing required. Using Node.js, Express, PostgreSQL. Looking for someone with backend experience to build automation pipelines. Payment verified, reasonable budget.',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'API'],
      paymentVerified: true,
      budgetAmount: 2000,
      clientHires: 8,
      clientTotalSpent: '$20K+',
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    expect(score.greenFlags.length).toBeGreaterThan(3);

    // Should detect backend/API
    const hasBackendFlag = score.greenFlags.some(
      (f) => f.toLowerCase().includes('backend') || f.toLowerCase().includes('api'),
    );
    expect(hasBackendFlag).toBe(true);

    // Should detect webhook/integration/automation
    const hasIntegrationFlag = score.greenFlags.some(
      (f) =>
        f.toLowerCase().includes('webhook') ||
        f.toLowerCase().includes('integration') ||
        f.toLowerCase().includes('automation'),
    );
    expect(hasIntegrationFlag).toBe(true);

    // Should detect payment verified
    const hasPaymentFlag = score.greenFlags.some(
      (f) => f.toLowerCase().includes('payment') || f.toLowerCase().includes('verified'),
    );
    expect(hasPaymentFlag).toBe(true);
  });

  it('should handle empty description gracefully', () => {
    const job = makeJob({
      title: '',
      description: '',
      skills: [],
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.label).toBeDefined();
    expect(score.dimensions.length).toBe(8);
    // Should not crash, should return a valid score
    expect(['Strong Fit', 'Possible Fit', 'Skip']).toContain(score.label);
  });

  it('should handle job with no skills array gracefully', () => {
    const job = makeJob({
      title: 'Backend developer needed',
      description: 'Need help building a backend API.',
      skills: [],
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.dimensions.length).toBe(8);
  });

  it('should score WordPress/avoid-list jobs lower', () => {
    const job = makeJob({
      title: 'WordPress Developer Needed',
      description:
        'We need a WordPress developer to customize our Shopify theme and build a simple landing page. Basic WordPress plugin development.',
      skills: ['WordPress', 'Shopify', 'HTML', 'CSS'],
      paymentVerified: true,
      budgetAmount: 200,
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    // Should be penalized for avoid list items
    const hasAvoidFlag = score.redFlags.some((f) => f.toLowerCase().includes('avoid list'));
    expect(hasAvoidFlag).toBe(true);
    expect(score.total).toBeLessThan(60);
  });

  it('should give higher scores to jobs with fewer proposals', () => {
    const baseJobData: Partial<ExtractedJob> = {
      title: 'Node.js Backend API Development',
      description:
        'Build a REST API with Node.js and PostgreSQL for our SaaS platform. Need webhook integration and background job processing.',
      skills: ['Node.js', 'PostgreSQL', 'REST API'],
      paymentVerified: true,
      budgetAmount: 2000,
      clientHires: 5,
    };

    const jobFewProposals = makeJob({
      ...baseJobData,
      proposalCount: '3',
    });

    const jobManyProposals = makeJob({
      ...baseJobData,
      proposalCount: '50+',
    });

    const scoreFew = scoreJob(jobFewProposals, defaultProfile, defaultCaseStudies);
    const scoreMany = scoreJob(jobManyProposals, defaultProfile, defaultCaseStudies);

    expect(scoreFew.total).toBeGreaterThanOrEqual(scoreMany.total);
  });

  it('should score dimensions between 0 and 10', () => {
    const job = makeJob({
      title: 'NestJS API Integration with Webhooks',
      description:
        'We need to integrate multiple third-party APIs using NestJS and process webhook events. PostgreSQL database with Redis caching. AWS deployment required.',
      skills: ['NestJS', 'PostgreSQL', 'Redis', 'AWS'],
      paymentVerified: true,
      budgetAmount: 5000,
    });

    const score = scoreJob(job, defaultProfile, defaultCaseStudies);

    for (const dim of score.dimensions) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(10);
      expect(dim.maxScore).toBe(10);
      expect(dim.name).toBeTruthy();
      expect(dim.reason).toBeTruthy();
    }
  });

  it('should clamp total score between 0 and 100', () => {
    // Job designed to maximize score
    const maxJob = makeJob({
      title: 'Senior Node.js NestJS Backend Developer - API Integration & Webhook Automation',
      description:
        'We need an expert backend developer for our SaaS platform. The project involves NestJS API integrations, webhook processing pipelines, CRM sync automation, PostgreSQL database design, Redis caching, BullMQ background jobs, and AWS deployment. Must have experience with scalable multi-tenant architecture, microservices, and production-grade systems. Clear deliverables: API gateway, webhook processor, admin dashboard backend. Milestone-based development with specific requirements for each phase.',
      skills: [
        'Node.js',
        'NestJS',
        'PostgreSQL',
        'MongoDB',
        'Redis',
        'AWS',
        'TypeScript',
        'BullMQ',
        'Socket.IO',
      ],
      paymentVerified: true,
      budgetAmount: 10000,
      clientHires: 50,
      clientTotalSpent: '$100K+',
      clientHireRate: '90%',
      proposalCount: '2',
      experienceLevel: 'Expert',
      screeningQuestions: ['Describe your experience with webhook processing'],
    });

    const score = scoreJob(maxJob, defaultProfile, defaultCaseStudies);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.total).toBeGreaterThanOrEqual(0);
  });
});
