import { notFound } from 'next/navigation';
import { getJobById, getCaseStudies } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import ScoreBadge from '@/components/ScoreBadge';
import JobDetailClient from './JobDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  seedDatabase();

  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

  let skills: string[];
  try {
    skills = job.skills ? JSON.parse(job.skills) : [];
  } catch {
    skills = [];
  }

  let screeningQuestions: string[];
  try {
    screeningQuestions = job.screening_questions ? JSON.parse(job.screening_questions) : [];
  } catch {
    screeningQuestions = [];
  }

  let scoreData: {
    total: number;
    label: string;
    reasons: Array<{ text: string; impact: string; weight: number }>;
    redFlags: string[];
    greenFlags: string[];
    dimensions: Array<{ name: string; score: number; maxScore: number; reason: string }>;
  } | null;
  try {
    scoreData = job.score_data ? JSON.parse(job.score_data) : null;
  } catch {
    scoreData = null;
  }

  let proposalData: {
    openingLine: string;
    shortProposal: string;
    detailedProposal: string;
    relevantExperience: string[];
    firstStep: string;
    clarifyingQuestions: string[];
    cta: string;
    matchingCaseStudies: string[];
    matchingTechnologies: string[];
    strategy: string;
    skipReason?: string;
  } | null;
  try {
    proposalData = job.proposal_data ? JSON.parse(job.proposal_data) : null;
  } catch {
    proposalData = null;
  }

  const caseStudies = getCaseStudies();
  const matchingCs = proposalData?.matchingCaseStudies ?? [];
  const matchedCaseStudies = caseStudies.filter((cs) => matchingCs.includes(cs.id as string));

  return (
    <div className="space-y-6">
      {/* Compliance reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-amber-500 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-xs text-amber-800">
          <strong>Review before using.</strong> Manual submission only. All generated content is a
          draft.
        </p>
      </div>

      {/* Back link */}
      <a
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </a>

      {/* Title + Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1"
            >
              View on Upwork
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
        {scoreData && <ScoreBadge score={scoreData.total} label={scoreData.label} size="lg" />}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Job Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Job Description</h2>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>

          {/* Screening Questions */}
          {screeningQuestions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Screening Questions</h2>
              <ol className="space-y-2">
                {screeningQuestions.map((q: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="font-semibold text-gray-400 shrink-0">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => {
                  const isMatch = proposalData?.matchingTechnologies?.some(
                    (t) => t.toLowerCase() === skill.toLowerCase(),
                  );
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1 text-sm rounded-lg font-medium ${
                        isMatch
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {skill}
                      {isMatch && (
                        <svg
                          className="w-3.5 h-3.5 inline ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Client Info</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.client_country && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Country</p>
                  <p className="text-gray-900 font-medium">{job.client_country}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs font-medium">Payment Verified</p>
                <p className="text-gray-900 font-medium">{job.payment_verified ? 'Yes' : 'No'}</p>
              </div>
              {job.client_hire_rate && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Hire Rate</p>
                  <p className="text-gray-900 font-medium">{job.client_hire_rate}</p>
                </div>
              )}
              {job.client_total_spent && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Total Spent</p>
                  <p className="text-gray-900 font-medium">{job.client_total_spent}</p>
                </div>
              )}
              {job.client_hires !== null && job.client_hires !== undefined && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Past Hires</p>
                  <p className="text-gray-900 font-medium">{job.client_hires}</p>
                </div>
              )}
              {job.proposal_count && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Proposals</p>
                  <p className="text-gray-900 font-medium">{job.proposal_count}</p>
                </div>
              )}
            </div>

            {/* Additional job fields */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              {job.budget && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Budget</p>
                  <p className="text-gray-900 font-medium">{job.budget}</p>
                </div>
              )}
              {job.hourly_range && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Hourly Range</p>
                  <p className="text-gray-900 font-medium">{job.hourly_range}</p>
                </div>
              )}
              {job.job_type && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Job Type</p>
                  <p className="text-gray-900 font-medium">{job.job_type}</p>
                </div>
              )}
              {job.experience_level && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Experience Level</p>
                  <p className="text-gray-900 font-medium">{job.experience_level}</p>
                </div>
              )}
              {job.estimated_duration && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Duration</p>
                  <p className="text-gray-900 font-medium">{job.estimated_duration}</p>
                </div>
              )}
              {job.connects_required && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Connects Required</p>
                  <p className="text-gray-900 font-medium">{job.connects_required}</p>
                </div>
              )}
              {job.category && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Category</p>
                  <p className="text-gray-900 font-medium">{job.category}</p>
                </div>
              )}
              {job.posted_time && (
                <div>
                  <p className="text-gray-500 text-xs font-medium">Posted</p>
                  <p className="text-gray-900 font-medium">{job.posted_time}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score dimensions */}
          {scoreData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Score Breakdown</h2>
              <div className="space-y-3">
                {scoreData.dimensions.map((dim, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{dim.name}</span>
                      <span className="text-gray-500">
                        {dim.score}/{dim.maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          dim.score >= 7
                            ? 'bg-green-500'
                            : dim.score >= 4
                              ? 'bg-amber-500'
                              : 'bg-red-400'
                        }`}
                        style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{dim.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Green flags */}
          {scoreData && scoreData.greenFlags.length > 0 && (
            <div className="bg-white rounded-xl border border-green-200 p-6">
              <h2 className="text-base font-semibold text-green-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Green Flags
              </h2>
              <ul className="space-y-2">
                {scoreData.greenFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="text-green-400 mt-0.5 shrink-0">+</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Red flags */}
          {scoreData && scoreData.redFlags.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h2 className="text-base font-semibold text-red-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Red Flags
              </h2>
              <ul className="space-y-2">
                {scoreData.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="text-red-400 mt-0.5 shrink-0">-</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Matching case studies */}
          {matchedCaseStudies.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Matching Case Studies</h2>
              <div className="space-y-3">
                {matchedCaseStudies.map((cs) => (
                  <div key={cs.id as string} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{cs.title as string}</p>
                    <p className="text-xs text-gray-500 mt-1">{cs.outcome as string}</p>
                    {Array.isArray(cs.technologies) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(cs.technologies as string[]).slice(0, 4).map((t: string, i: number) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching technologies */}
          {proposalData && proposalData.matchingTechnologies.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Technology Match</h2>
              <div className="flex flex-wrap gap-2">
                {proposalData.matchingTechnologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proposal section and interactive elements */}
      <JobDetailClient
        jobId={job.id}
        initialNotes={job.notes ?? ''}
        initialStatus={job.status}
        proposalData={proposalData}
      />
    </div>
  );
}
