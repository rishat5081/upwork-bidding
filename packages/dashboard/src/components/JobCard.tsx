import Link from 'next/link';
import ScoreBadge from './ScoreBadge';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    skills?: string | null;
    posted_time?: string | null;
    budget?: string | null;
    client_country?: string | null;
    status: string;
    score_data?: string | null;
    saved_at: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  let skills: string[];
  try {
    skills = job.skills ? JSON.parse(job.skills) : [];
  } catch {
    skills = [];
  }

  let scoreData: { total: number; label: string } | null;
  try {
    scoreData = job.score_data ? JSON.parse(job.score_data) : null;
  } catch {
    scoreData = null;
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
    applied: 'bg-green-100 text-green-700 border-green-200',
    skipped: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">{job.title}</h3>
        {scoreData && <ScoreBadge score={scoreData.total} label={scoreData.label} size="sm" />}
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills.slice(0, 5).map((skill: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-gray-400">+{skills.length - 5} more</span>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span
          className={`px-2 py-0.5 rounded-full border text-xs font-medium ${statusColors[job.status] ?? statusColors.new}`}
        >
          {job.status}
        </span>
        {job.budget && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {job.budget}
          </span>
        )}
        {job.client_country && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {job.client_country}
          </span>
        )}
        {job.posted_time && <span>{job.posted_time}</span>}
      </div>
    </Link>
  );
}
