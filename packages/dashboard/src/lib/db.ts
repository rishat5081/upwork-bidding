import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface JobRow {
  id: string;
  title: string;
  description: string;
  client_country: string | null;
  payment_verified: number | null;
  budget: string | null;
  budget_amount: number | null;
  job_type: string | null;
  hourly_range: string | null;
  experience_level: string | null;
  estimated_duration: string | null;
  project_type: string | null;
  category: string | null;
  client_hire_rate: string | null;
  client_total_spent: string | null;
  client_hires: number | null;
  proposal_count: string | null;
  skills: string | null;
  posted_time: string | null;
  screening_questions: string | null;
  connects_required: string | null;
  url: string | null;
  extracted_at: string;
  score_data: string | null;
  proposal_data: string | null;
  notes: string | null;
  status: string;
  saved_at: string;
}

interface DbData {
  jobs: JobRow[];
  profile: Record<string, unknown> | null;
  caseStudies: Array<Record<string, unknown> & { id: string }>;
  templates: Array<Record<string, unknown> & { id: string }>;
  settings: Record<string, unknown> | null;
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDb(): DbData {
  ensureDataDir();
  if (!existsSync(DB_FILE)) {
    const empty: DbData = {
      jobs: [],
      profile: null,
      caseStudies: [],
      templates: [],
      settings: null,
    };
    writeFileSync(DB_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  } catch {
    const empty: DbData = {
      jobs: [],
      profile: null,
      caseStudies: [],
      templates: [],
      settings: null,
    };
    writeFileSync(DB_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
}

function writeDb(data: DbData): void {
  ensureDataDir();
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --------------- Job Helpers ---------------

export function getAllJobs(statusFilter?: string): JobRow[] {
  const data = readDb();
  let jobs = data.jobs.sort(
    (a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime(),
  );
  if (statusFilter && statusFilter !== 'all') {
    jobs = jobs.filter((j) => j.status === statusFilter);
  }
  return jobs;
}

export function getJobById(id: string): JobRow | undefined {
  const data = readDb();
  return data.jobs.find((j) => j.id === id);
}

export function saveJob(
  job: Partial<JobRow> & { id: string; title: string; description: string; extracted_at: string },
): void {
  const data = readDb();
  const idx = data.jobs.findIndex((j) => j.id === job.id);

  const row: JobRow = {
    id: job.id,
    title: job.title,
    description: job.description,
    client_country: job.client_country ?? null,
    payment_verified: job.payment_verified ?? null,
    budget: job.budget ?? null,
    budget_amount: job.budget_amount ?? null,
    job_type: job.job_type ?? null,
    hourly_range: job.hourly_range ?? null,
    experience_level: job.experience_level ?? null,
    estimated_duration: job.estimated_duration ?? null,
    project_type: job.project_type ?? null,
    category: job.category ?? null,
    client_hire_rate: job.client_hire_rate ?? null,
    client_total_spent: job.client_total_spent ?? null,
    client_hires: job.client_hires ?? null,
    proposal_count: job.proposal_count ?? null,
    skills: job.skills
      ? typeof job.skills === 'string'
        ? job.skills
        : JSON.stringify(job.skills)
      : null,
    posted_time: job.posted_time ?? null,
    screening_questions: job.screening_questions
      ? typeof job.screening_questions === 'string'
        ? job.screening_questions
        : JSON.stringify(job.screening_questions)
      : null,
    connects_required: job.connects_required ?? null,
    url: job.url ?? null,
    extracted_at: job.extracted_at,
    score_data: job.score_data ?? null,
    proposal_data: job.proposal_data ?? null,
    notes: job.notes ?? null,
    status: job.status ?? 'new',
    saved_at: job.saved_at ?? new Date().toISOString(),
  };

  if (idx >= 0) {
    data.jobs[idx] = { ...data.jobs[idx], ...row, saved_at: new Date().toISOString() };
  } else {
    data.jobs.push(row);
  }
  writeDb(data);
}

export function updateJobStatus(id: string, status: string): void {
  const data = readDb();
  const job = data.jobs.find((j) => j.id === id);
  if (job) {
    job.status = status;
    writeDb(data);
  }
}

export function updateJobNotes(id: string, notes: string): void {
  const data = readDb();
  const job = data.jobs.find((j) => j.id === id);
  if (job) {
    job.notes = notes;
    writeDb(data);
  }
}

export function deleteJob(id: string): void {
  const data = readDb();
  data.jobs = data.jobs.filter((j) => j.id !== id);
  writeDb(data);
}

// --------------- Profile Helpers ---------------

export function getProfile(): Record<string, unknown> | null {
  const data = readDb();
  return data.profile;
}

export function saveProfile(profile: Record<string, unknown>): void {
  const data = readDb();
  data.profile = profile;
  writeDb(data);
}

// --------------- Case Studies Helpers ---------------

export function getCaseStudies(): Array<Record<string, unknown>> {
  const data = readDb();
  return data.caseStudies;
}

export function saveCaseStudy(cs: Record<string, unknown> & { id: string }): void {
  const data = readDb();
  const idx = data.caseStudies.findIndex((c) => c.id === cs.id);
  if (idx >= 0) {
    data.caseStudies[idx] = cs;
  } else {
    data.caseStudies.push(cs);
  }
  writeDb(data);
}

export function deleteCaseStudy(id: string): void {
  const data = readDb();
  data.caseStudies = data.caseStudies.filter((c) => c.id !== id);
  writeDb(data);
}

// --------------- Settings Helpers ---------------

export function getSettings(): Record<string, unknown> | null {
  const data = readDb();
  return data.settings;
}

export function saveSettings(settings: Record<string, unknown>): void {
  const data = readDb();
  data.settings = settings;
  writeDb(data);
}

// --------------- Templates Helpers ---------------

export function getTemplates(): Array<Record<string, unknown>> {
  const data = readDb();
  return data.templates;
}

export function saveTemplate(template: Record<string, unknown> & { id: string }): void {
  const data = readDb();
  const idx = data.templates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    data.templates[idx] = template;
  } else {
    data.templates.push(template);
  }
  writeDb(data);
}

export function deleteTemplate(id: string): void {
  const data = readDb();
  data.templates = data.templates.filter((t) => t.id !== id);
  writeDb(data);
}
