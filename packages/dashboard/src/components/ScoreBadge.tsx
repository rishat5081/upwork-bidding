interface ScoreBadgeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  let bgColor: string;
  let textColor: string;
  let borderColor: string;

  if (score >= 70) {
    bgColor = 'bg-green-50';
    textColor = 'text-green-700';
    borderColor = 'border-green-200';
  } else if (score >= 41) {
    bgColor = 'bg-amber-50';
    textColor = 'text-amber-700';
    borderColor = 'border-amber-200';
  } else {
    bgColor = 'bg-red-50';
    textColor = 'text-red-700';
    borderColor = 'border-red-200';
  }

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex flex-col items-center gap-1 px-6 py-4 rounded-xl border-2 ${bgColor} ${borderColor}`}
      >
        <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
        <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${bgColor} ${textColor} ${borderColor}`}
      >
        {score} {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${bgColor} ${textColor} ${borderColor}`}
    >
      <span className="font-bold">{score}</span>
      <span>{label}</span>
    </span>
  );
}
