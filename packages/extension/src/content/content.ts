// ---------------------------------------------------------------------------
// Upwork Bidder – Content Script
// ---------------------------------------------------------------------------
// Injected into Upwork job pages. Does NOT auto-extract or poll.
// All extraction is user-initiated (button click or popup message).
// ---------------------------------------------------------------------------

import { extractJobData, isUpworkJobPage, type ExtractedJobData } from '../extractor';

const DASHBOARD_URL = 'http://localhost:3000';
const API_URL = `${DASHBOARD_URL}/api/jobs`;

const BUTTON_ID = 'upwork-bidder-analyze-btn';
const TOAST_CONTAINER_ID = 'upwork-bidder-toast-container';

// ---------------------------------------------------------------------------
// Toast Notification System
// ---------------------------------------------------------------------------

function getOrCreateToastContainer(): HTMLElement {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
  const container = getOrCreateToastContainer();

  const toast = document.createElement('div');
  toast.className = `upwork-bidder-toast upwork-bidder-toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger slide-in
  requestAnimationFrame(() => {
    toast.classList.add('upwork-bidder-toast--visible');
  });

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('upwork-bidder-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), {
      once: true,
    });
    // Fallback removal in case transitionend doesn't fire
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ---------------------------------------------------------------------------
// Floating Analyze Button
// ---------------------------------------------------------------------------

function injectAnalyzeButton() {
  // Don't inject twice
  if (document.getElementById(BUTTON_ID)) return;

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.textContent = 'Analyze This Job';
  btn.title = 'Extract job data and send to Upwork Bidder dashboard';
  btn.type = 'button';

  btn.addEventListener('click', handleAnalyzeClick);
  document.body.appendChild(btn);
}

async function handleAnalyzeClick() {
  const btn = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
  if (!btn) return;

  // Prevent double-click
  btn.disabled = true;
  btn.textContent = 'Analyzing...';

  try {
    const jobData = extractJobData();

    if (!jobData) {
      showToast('Could not extract job data from this page.', 'error');
      return;
    }

    showToast('Sending to dashboard...', 'info', 2000);

    const response = await sendToDashboard(jobData);
    if (response) {
      showToast('Job sent to dashboard!', 'success');
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
      showToast('Dashboard not running. Start server at localhost:3000.', 'error', 5000);
    } else {
      showToast(`Error: ${errMsg}`, 'error', 5000);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Analyze This Job';
    }
  }
}

async function sendToDashboard(jobData: ExtractedJobData): Promise<Record<string, unknown> | null> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${errText}`);
  }

  return await res.json();
}

// ---------------------------------------------------------------------------
// Message Listener (communication with popup / background)
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (
    message: { action: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (message.action === 'ping') {
      sendResponse({ isJobPage: isUpworkJobPage() });
      return false; // synchronous
    }

    if (message.action === 'extract') {
      const data = extractJobData();
      sendResponse(data);
      return false; // synchronous
    }

    return false;
  },
);

// ---------------------------------------------------------------------------
// Init – runs once on document_idle
// ---------------------------------------------------------------------------

function init() {
  if (isUpworkJobPage()) {
    injectAnalyzeButton();
  }
}

init();
