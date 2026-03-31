'use client';

import { useState, useEffect } from 'react';

interface SettingsData {
  llmProvider: string;
  apiKey: string;
  dashboardPort: number;
  autoScoreOnReceive: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    llmProvider: 'none',
    apiKey: '',
    dashboardPort: 3000,
    autoScoreOnReceive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    window.open('/api/jobs/export', '_blank');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (Array.isArray(data)) {
          for (const job of data) {
            await fetch('/api/jobs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(job),
            });
          }
          alert(`Imported ${data.length} jobs successfully.`);
        } else {
          alert('Invalid format. Expected a JSON array of jobs.');
        }
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import. Check the file format.');
      }
    };
    input.click();
  };

  const handleReset = async () => {
    if (!confirm('Reset all settings to defaults? This will not delete jobs.')) return;
    const defaults = {
      llmProvider: 'none',
      apiKey: '',
      dashboardPort: 3000,
      autoScoreOnReceive: true,
    };
    setSettings(defaults);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaults),
      });
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your dashboard preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            saved ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* LLM Provider */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">LLM Configuration</h2>
        <p className="text-xs text-gray-500">
          Optional. Connect an LLM provider for AI-enhanced proposal generation. The rule-based
          engine works without this.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <select
            value={settings.llmProvider}
            onChange={(e) => setSettings({ ...settings, llmProvider: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None (Rule-based only)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        {settings.llmProvider !== 'none' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey ?? ''}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="sk-..."
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* General */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">General</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard Port</label>
          <input
            type="number"
            value={settings.dashboardPort}
            disabled
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Port is set in package.json and cannot be changed here.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Auto-score on Receive</p>
            <p className="text-xs text-gray-500">
              Automatically score and generate proposals when jobs are received
            </p>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, autoScoreOnReceive: !settings.autoScoreOnReceive })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.autoScoreOnReceive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoScoreOnReceive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Data Management</h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export All Data (JSON)
          </button>

          <button
            onClick={handleImport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Import Data (JSON)
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
