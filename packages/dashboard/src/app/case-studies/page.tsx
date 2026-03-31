'use client';

import { useState, useEffect } from 'react';

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  problem: string;
  solution: string;
  technologies: string[];
  outcome: string;
  tags: string[];
}

const emptyCaseStudy: Omit<CaseStudy, 'id'> = {
  title: '',
  client: '',
  problem: '',
  solution: '',
  technologies: [],
  outcome: '',
  tags: [],
};

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CaseStudy, 'id'>>(emptyCaseStudy);
  const [techInput, setTechInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetch('/api/case-studies')
      .then((res) => res.json())
      .then((data) => {
        setCaseStudies(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...form, id: editId } : form;

    try {
      const res = await fetch('/api/case-studies', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editId) {
          setCaseStudies((prev) => prev.map((cs) => (cs.id === editId ? saved : cs)));
        } else {
          setCaseStudies((prev) => [...prev, saved]);
        }
        resetForm();
      }
    } catch (err) {
      console.error('Failed to save case study:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this case study?')) return;
    try {
      await fetch('/api/case-studies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setCaseStudies((prev) => prev.filter((cs) => cs.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const startEdit = (cs: CaseStudy) => {
    setEditId(cs.id);
    setForm({
      title: cs.title,
      client: cs.client,
      problem: cs.problem,
      solution: cs.solution,
      technologies: cs.technologies ?? [],
      outcome: cs.outcome,
      tags: cs.tags ?? [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyCaseStudy);
    setEditId(null);
    setShowForm(false);
    setTechInput('');
    setTagInput('');
  };

  const addTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !form.technologies.includes(trimmed)) {
      setForm({ ...form, technologies: [...form.technologies, trimmed] });
    }
    setTechInput('');
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm({ ...form, tags: [...form.tags, trimmed] });
    }
    setTagInput('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading case studies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Studies</h1>
          <p className="text-sm text-gray-500 mt-1">{caseStudies.length} case studies configured</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Case Study
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            {editId ? 'Edit Case Study' : 'New Case Study'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Project title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Client name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
            <textarea
              value={form.problem}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What problem did you solve?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
            <textarea
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How did you solve it?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
            <input
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What was the result?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.technologies.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                >
                  {t}
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        technologies: form.technologies.filter((_, j) => j !== i),
                      })
                    }
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add technology"
              />
              <button
                onClick={addTech}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md border border-gray-200"
                >
                  {t}
                  <button
                    onClick={() => setForm({ ...form, tags: form.tags.filter((_, j) => j !== i) })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add tag"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {editId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Case study list */}
      <div className="space-y-3">
        {caseStudies.map((cs) => (
          <div key={cs.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === cs.id ? null : cs.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{cs.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cs.client} &middot; {cs.outcome}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {(cs.tags ?? []).slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded"
                  >
                    {tag}
                  </span>
                ))}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === cs.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {expandedId === cs.id && (
              <div className="px-6 pb-5 border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Problem</p>
                  <p className="text-sm text-gray-700">{cs.problem}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Solution</p>
                  <p className="text-sm text-gray-700">{cs.solution}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Technologies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(cs.technologies ?? []).map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => startEdit(cs)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cs.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {caseStudies.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">No case studies yet. Add your first one above.</p>
        </div>
      )}
    </div>
  );
}
