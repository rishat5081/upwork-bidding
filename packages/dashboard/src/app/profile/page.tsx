'use client';

import { useState, useEffect } from 'react';

interface ProfileData {
  headline: string;
  summary: string;
  niche: string;
  preferredStacks: string[];
  preferredJobTypes: string[];
  minimumBudget: number;
  avoidList: string[];
  proposalTone: string;
  yearsOfExperience: number;
  workHistory: Array<{
    company: string;
    role: string;
    period: string;
    description: string;
    highlights: string[];
  }>;
  skills: Record<string, string[]>;
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg border border-gray-200"
          >
            {tag}
            <button
              onClick={() => removeTag(i)}
              className="text-gray-400 hover:text-gray-600 ml-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={addTag}
          className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No profile data found. Please check your database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your freelancer profile used for scoring and proposal generation
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            saved ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* Core fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Core Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
          <input
            value={profile.headline ?? ''}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea
            value={profile.summary ?? ''}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
          <input
            value={profile.niche ?? ''}
            onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              value={profile.yearsOfExperience ?? 0}
              onChange={(e) =>
                setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Budget ($)
            </label>
            <input
              type="number"
              value={profile.minimumBudget ?? 0}
              onChange={(e) =>
                setProfile({ ...profile, minimumBudget: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Tone</label>
          <select
            value={profile.proposalTone ?? 'direct'}
            onChange={(e) => setProfile({ ...profile, proposalTone: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="direct">Direct</option>
            <option value="formal">Formal</option>
            <option value="conversational">Conversational</option>
            <option value="technical">Technical</option>
          </select>
        </div>
      </div>

      {/* Preferred Stacks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Preferred Stacks</h2>
        <TagInput
          tags={profile.preferredStacks ?? []}
          onChange={(tags) => setProfile({ ...profile, preferredStacks: tags })}
          placeholder="Add a technology (e.g. Node.js)"
        />
      </div>

      {/* Preferred Job Types */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Preferred Job Types</h2>
        <TagInput
          tags={profile.preferredJobTypes ?? []}
          onChange={(tags) => setProfile({ ...profile, preferredJobTypes: tags })}
          placeholder="Add a job type (e.g. API Integration)"
        />
      </div>

      {/* Avoid List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Avoid List</h2>
        <p className="text-xs text-gray-500">
          Jobs matching these keywords will be penalized in scoring.
        </p>
        <TagInput
          tags={profile.avoidList ?? []}
          onChange={(tags) => setProfile({ ...profile, avoidList: tags })}
          placeholder="Add a keyword to avoid (e.g. WordPress)"
        />
      </div>

      {/* Work History (display only) */}
      {profile.workHistory && profile.workHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Work History</h2>
          <div className="space-y-4">
            {profile.workHistory.map((wh, i) => (
              <div key={i} className="border-l-2 border-gray-200 pl-4">
                <p className="text-sm font-semibold text-gray-900">{wh.role}</p>
                <p className="text-sm text-gray-600">
                  {wh.company} &middot; {wh.period}
                </p>
                <p className="text-sm text-gray-500 mt-1">{wh.description}</p>
                {wh.highlights && wh.highlights.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {wh.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-gray-300 rounded-full shrink-0"></span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills (display) */}
      {profile.skills && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Skills</h2>
          <div className="space-y-3">
            {Object.entries(profile.skills).map(([category, skillList]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(skillList as string[]).map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
