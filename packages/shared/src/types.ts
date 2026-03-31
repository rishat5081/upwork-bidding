// ─── Job extracted from Upwork page ─────────────────────────────────────────

export interface ExtractedJob {
  id: string; // generated UUID
  title: string;
  description: string;
  clientCountry?: string;
  paymentVerified?: boolean;
  budget?: string;
  budgetAmount?: number;
  jobType?: 'hourly' | 'fixed';
  hourlyRange?: string;
  experienceLevel?: string;
  estimatedDuration?: string;
  projectType?: string;
  category?: string;
  clientHireRate?: string;
  clientTotalSpent?: string;
  clientHires?: number;
  proposalCount?: string;
  skills: string[];
  postedTime?: string;
  screeningQuestions?: string[];
  connectsRequired?: string;
  url?: string;
  extractedAt: string; // ISO timestamp
}

// ─── Stored job with scoring ────────────────────────────────────────────────

export interface ScoredJob extends ExtractedJob {
  score: JobScore;
  proposals?: GeneratedProposal;
  notes?: string;
  status: 'new' | 'reviewed' | 'applied' | 'skipped' | 'archived';
  savedAt: string;
}

// ─── Score result ───────────────────────────────────────────────────────────

export interface JobScore {
  total: number; // 0-100
  label: 'Strong Fit' | 'Possible Fit' | 'Skip';
  reasons: ScoreReason[];
  redFlags: string[];
  greenFlags: string[];
  dimensions: ScoreDimension[];
}

export interface ScoreReason {
  text: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface ScoreDimension {
  name: string;
  score: number; // 0-10
  maxScore: number;
  reason: string;
}

// ─── Proposal ───────────────────────────────────────────────────────────────

export interface GeneratedProposal {
  openingLine: string;
  shortProposal: string; // 5-8 sentences
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

// ─── User profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  headline: string;
  summary: string;
  niche: string;
  preferredJobTypes: string[];
  minimumBudget: number;
  preferredStacks: string[];
  avoidList: string[];
  proposalTone: 'direct' | 'friendly' | 'formal';
  workHistory: WorkEntry[];
  skills: SkillCategory[];
  projects: ProjectEntry[];
  yearsOfExperience: number;
  strongestEvidence: string[];
}

export interface WorkEntry {
  company: string;
  role: string;
  dates: string;
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
}

// ─── Case studies ───────────────────────────────────────────────────────────

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  problem: string;
  solution: string;
  technologies: string[];
  outcome: string;
  tags: string[];
}

// ─── Templates & settings ───────────────────────────────────────────────────

export interface ProposalTemplate {
  id: string;
  name: string;
  content: string;
  tags: string[];
}

export interface AppSettings {
  llmProvider: 'none' | 'openai' | 'anthropic';
  llmApiKey?: string;
  dashboardPort: number;
  autoScoreOnReceive: boolean;
}
