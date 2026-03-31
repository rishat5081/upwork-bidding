import Link from 'next/link';
import { getAllJobs } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import JobCard from '@/components/JobCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string; sort?: string }>;
}

export default async function JobsInboxPage({ searchParams }: PageProps) {
  seedDatabase();

  const params = await searchParams;
  const statusFilter = params.status ?? 'all';
  const sortBy = params.sort ?? 'date';

  let jobs = getAllJobs(statusFilter === 'all' ? undefined : statusFilter);

  // Sort
  if (sortBy === 'score') {
    jobs = [...jobs].sort((a, b) => {
      const scoreA = a.score_data ? JSON.parse(a.score_data).total : 0;
      const scoreB = b.score_data ? JSON.parse(b.score_data).total : 0;
      return scoreB - scoreA;
    });
  }

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'applied', label: 'Applied' },
    { value: 'skipped', label: 'Skipped' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/api/jobs/export"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export JSON
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {statusOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`/jobs?status=${opt.value}&sort=${sortBy}`}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                statusFilter === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <Link
            href={`/jobs?status=${statusFilter}&sort=date`}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortBy === 'date' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            By Date
          </Link>
          <Link
            href={`/jobs?status=${statusFilter}&sort=score`}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortBy === 'score' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            By Score
          </Link>
        </div>
      </div>

      {/* Job list */}
      {jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs yet</h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">
            Jobs appear here when you extract them from Upwork using the Chrome extension. The
            extension sends job data to this dashboard where it gets automatically scored and
            analyzed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto text-left">
            <p className="text-xs font-semibold text-gray-700 mb-2">How to get started:</p>
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
              <li>Install the Chrome extension</li>
              <li>Navigate to a job posting on Upwork</li>
              <li>Click the extension to extract job data</li>
              <li>The job will appear here with scoring and a draft proposal</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              Or POST job data to{' '}
              <code className="bg-white px-1 py-0.5 rounded border text-[11px]">
                http://localhost:3000/api/jobs
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
