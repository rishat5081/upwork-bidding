import Link from 'next/link';
import { getAllJobs } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import JobCard from '@/components/JobCard';

export const dynamic = 'force-dynamic';

export default function OverviewPage() {
  seedDatabase();

  const jobs = getAllJobs();
  const recentJobs = jobs.slice(0, 5);

  let strongFits = 0;
  let possibleFits = 0;
  let skips = 0;

  for (const job of jobs) {
    try {
      const score = job.score_data ? JSON.parse(job.score_data) : null;
      if (!score) continue;
      if (score.label === 'Strong Fit') strongFits++;
      else if (score.label === 'Possible Fit') possibleFits++;
      else skips++;
    } catch {
      // skip
    }
  }

  return (
    <div className="space-y-6">
      {/* Compliance banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <svg
          className="w-5 h-5 text-amber-500 shrink-0"
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
        <p className="text-sm text-amber-800">
          <strong>Manual Assist Only.</strong> All proposals are generated as drafts. You must
          review and manually submit every proposal on Upwork. No automated bidding.
        </p>
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Job analysis dashboard and quick actions</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Total Analyzed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-5">
          <p className="text-sm font-medium text-green-600">Strong Fits</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{strongFits}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <p className="text-sm font-medium text-amber-600">Possible Fits</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{possibleFits}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <p className="text-sm font-medium text-red-600">Skips</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{skips}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        {jobs.length > 0 && (
          <Link
            href={`/jobs/${jobs[0].id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Open Latest Job
          </Link>
        )}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          View All Jobs
        </Link>
      </div>

      {/* Recent jobs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Jobs</h2>
        {recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
            <h3 className="text-base font-semibold text-gray-700 mb-1">No jobs analyzed yet</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Use the Chrome extension to extract job data from Upwork, or POST job data to{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/api/jobs</code> to get
              started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
