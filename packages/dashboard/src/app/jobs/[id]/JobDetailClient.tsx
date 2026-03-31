'use client';

import { useState, useCallback } from 'react';
import CopyButton from '@/components/CopyButton';

interface ProposalData {
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
}

interface Props {
  jobId: string;
  initialNotes: string;
  initialStatus: string;
  proposalData: ProposalData | null;
}

const TABS = [
  { key: 'opening', label: 'Opening Line' },
  { key: 'short', label: 'Short Proposal' },
  { key: 'detailed', label: 'Detailed' },
  { key: 'experience', label: 'Experience' },
  { key: 'firstStep', label: 'First Step' },
  { key: 'questions', label: 'Questions' },
  { key: 'cta', label: 'CTA' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function JobDetailClient({
  jobId,
  initialNotes,
  initialStatus,
  proposalData,
}: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState(initialStatus);
  const [activeTab, setActiveTab] = useState<TabKey>('short');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(proposalData);

  const saveNotes = useCallback(
    async (value: string) => {
      setSaving(true);
      try {
        await fetch(`/api/jobs/${jobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: value }),
        });
      } catch (err) {
        console.error('Failed to save notes:', err);
      } finally {
        setSaving(false);
      }
    },
    [jobId],
  );

  const updateStatus = useCallback(
    async (newStatus: string) => {
      setStatus(newStatus);
      try {
        await fetch(`/api/jobs/${jobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    },
    [jobId],
  );

  const regenerateProposal = useCallback(async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/proposal`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
      }
    } catch (err) {
      console.error('Failed to regenerate proposal:', err);
    } finally {
      setRegenerating(false);
    }
  }, [jobId]);

  function getTabContent(): string {
    if (!proposal) return '';
    switch (activeTab) {
      case 'opening':
        return proposal.openingLine;
      case 'short':
        return proposal.shortProposal;
      case 'detailed':
        return proposal.detailedProposal;
      case 'experience':
        return proposal.relevantExperience.map((e, i) => `${i + 1}. ${e}`).join('\n\n');
      case 'firstStep':
        return proposal.firstStep;
      case 'questions':
        return proposal.clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
      case 'cta':
        return proposal.cta;
      default:
        return '';
    }
  }

  return (
    <div className="space-y-6">
      {/* Status and Notes row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Status</h2>
          <div className="flex gap-2">
            {['new', 'reviewed', 'applied', 'skipped'].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
                  status === s
                    ? s === 'applied'
                      ? 'bg-green-600 text-white border-green-600'
                      : s === 'skipped'
                        ? 'bg-gray-600 text-white border-gray-600'
                        : s === 'reviewed'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Notes</h2>
            {saving && <span className="text-xs text-gray-400">Saving...</span>}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={(e) => saveNotes(e.target.value)}
            placeholder="Add your notes about this job..."
            className="w-full h-28 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Proposal section */}
      {proposal && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Generated Proposal</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Strategy: <span className="font-medium capitalize">{proposal.strategy}</span>
                {proposal.skipReason && (
                  <span className="text-red-500 ml-2">{proposal.skipReason}</span>
                )}
              </p>
            </div>
            <button
              onClick={regenerateProposal}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <CopyButton text={getTabContent()} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 pr-20 min-h-[200px]">
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {getTabContent() || 'No content available for this section.'}
              </div>
            </div>
          </div>

          {/* Copy all */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Review all content before submitting. This is a draft only.
            </p>
            <CopyButton text={proposal.shortProposal} label="Copy Short Proposal" />
          </div>
        </div>
      )}

      {!proposal && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">No proposal generated for this job.</p>
          <button
            onClick={regenerateProposal}
            disabled={regenerating}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {regenerating ? 'Generating...' : 'Generate Proposal'}
          </button>
        </div>
      )}
    </div>
  );
}
