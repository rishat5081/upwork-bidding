'use client';

import { useState, useEffect } from 'react';
import CopyButton from '@/components/CopyButton';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('opening');

  useEffect(() => {
    fetch('/api/settings') // We'll use a dedicated templates endpoint
      .catch(() => {});
    fetch('/api/case-studies').catch(() => {});
    // Load templates
    fetch('/api/templates')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setTemplates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!formName.trim() || !formContent.trim()) return;

    const body = {
      ...(editId ? { id: editId } : {}),
      name: formName,
      content: formContent,
      category: formCategory,
      createdAt: new Date().toISOString(),
    };

    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editId) {
          setTemplates((prev) => prev.map((t) => (t.id === editId ? saved : t)));
        } else {
          setTemplates((prev) => [...prev, saved]);
        }
        resetForm();
      }
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const startEdit = (t: Template) => {
    setEditId(t.id);
    setFormName(t.name);
    setFormContent(t.content);
    setFormCategory(t.category ?? 'opening');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setFormName('');
    setFormContent('');
    setFormCategory('opening');
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Reusable proposal sections and snippets</p>
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
          New Template
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            {editId ? 'Edit Template' : 'New Template'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="opening">Opening Line</option>
                <option value="body">Proposal Body</option>
                <option value="cta">Call to Action</option>
                <option value="question">Question</option>
                <option value="experience">Experience Snippet</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Template content... Use {{variable}} for dynamic fields."
            />
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

      {/* Template list */}
      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded capitalize">
                  {t.category ?? 'other'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <CopyButton text={t.content} />
                <button
                  onClick={() => startEdit(t)}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <pre className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-sans overflow-hidden max-h-32">
              {t.content}
            </pre>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No templates yet</h3>
          <p className="text-sm text-gray-500">
            Create reusable proposal snippets to speed up your workflow.
          </p>
        </div>
      )}
    </div>
  );
}
