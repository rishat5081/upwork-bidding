// ---------------------------------------------------------------------------
// Upwork Bidder – Popup Script
// ---------------------------------------------------------------------------
// All actions are user-initiated. No background polling.
// ---------------------------------------------------------------------------

const DASHBOARD_URL = 'http://localhost:3000';
const API_URL = `${DASHBOARD_URL}/api/jobs`;

// DOM references
const statusIcon = document.getElementById('status-icon')!;
const statusText = document.getElementById('status-text')!;
const jobPreview = document.getElementById('job-preview')!;
const jobTitlePreview = document.getElementById('job-title-preview')!;
const scorePreview = document.getElementById('score-preview')!;
const scoreBadge = document.getElementById('score-badge')!;
const scoreValue = document.getElementById('score-value')!;
const btnAnalyze = document.getElementById('btn-analyze') as HTMLButtonElement;
const btnSend = document.getElementById('btn-send') as HTMLButtonElement;
const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
const btnDashboard = document.getElementById('btn-dashboard') as HTMLButtonElement;
const messageEl = document.getElementById('message')!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function showMessage(text: string, type: 'success' | 'error' | 'info' = 'info') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.classList.remove('hidden');
  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, 5000);
}

function setLoading(loading: boolean) {
  btnAnalyze.disabled = loading;
  if (loading) {
    document.body.classList.add('loading');
    btnAnalyze.textContent = 'Analyzing...';
  } else {
    document.body.classList.remove('loading');
    btnAnalyze.textContent = 'Analyze Current Job';
  }
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab ?? null;
}

function isUpworkJobUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('upwork.com/jobs/') ||
    url.includes('upwork.com/freelance-jobs/') ||
    url.includes('upwork.com/ab/proposals/job/')
  );
}

/** Send a message to the content script in the active tab. */
async function sendToContentScript(
  tabId: number,
  message: Record<string, unknown>,
): Promise<unknown> {
  return chrome.tabs.sendMessage(tabId, message);
}

/** POST extracted job data to the dashboard API. */
async function sendToDashboard(jobData: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Dashboard API error ${res.status}: ${errText}`);
  }
  return res.json();
}

/** Format job data as a human-readable text summary. */
function formatJobSummary(job: Record<string, unknown>): string {
  const lines: string[] = [];
  if (job.title) lines.push(`Title: ${job.title}`);
  if (job.url) lines.push(`URL: ${job.url}`);
  if (job.jobType) lines.push(`Type: ${job.jobType}`);
  if (job.budget) lines.push(`Budget: ${job.budget}`);
  if (job.hourlyRange) lines.push(`Hourly Range: ${job.hourlyRange}`);
  if (job.experienceLevel) lines.push(`Experience: ${job.experienceLevel}`);
  if (job.estimatedDuration) lines.push(`Duration: ${job.estimatedDuration}`);
  if (job.clientCountry) lines.push(`Client: ${job.clientCountry}`);
  if (job.clientTotalSpent) lines.push(`Client Spent: ${job.clientTotalSpent}`);
  if (job.clientHireRate) lines.push(`Hire Rate: ${job.clientHireRate}`);
  if (job.proposalCount) lines.push(`Proposals: ${job.proposalCount}`);
  if (job.connectsRequired) lines.push(`Connects: ${job.connectsRequired}`);
  const skills = job.skills as string[] | undefined;
  if (skills?.length) lines.push(`Skills: ${skills.join(', ')}`);
  lines.push('');
  if (job.description) lines.push(`Description:\n${job.description}`);

  const questions = job.screeningQuestions as string[] | undefined;
  if (questions?.length) {
    lines.push('');
    lines.push('Screening Questions:');
    questions.forEach((q, i) => lines.push(`  ${i + 1}. ${q}`));
  }

  return lines.join('\n');
}

function showScore(result: Record<string, unknown>) {
  const score = result.score as Record<string, unknown> | undefined;
  if (!score) return;

  const label = (score.label as string) ?? (score.recommendation as string) ?? '';
  const value = score.score ?? score.value ?? '';

  if (!label) return;

  scorePreview.classList.remove('hidden');

  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('strong')) {
    scoreBadge.className = 'score-badge strong-fit';
    scoreBadge.textContent = 'Strong Fit';
  } else if (lowerLabel.includes('possible') || lowerLabel.includes('maybe')) {
    scoreBadge.className = 'score-badge possible-fit';
    scoreBadge.textContent = 'Possible Fit';
  } else {
    scoreBadge.className = 'score-badge skip';
    scoreBadge.textContent = 'Skip';
  }

  if (value) {
    scoreValue.textContent = `Score: ${value}`;
  }
}

// ---------------------------------------------------------------------------
// Initialise
// ---------------------------------------------------------------------------

async function init() {
  const tab = await getCurrentTab();

  if (!tab?.id || !isUpworkJobUrl(tab.url)) {
    statusIcon.className = 'status-icon error';
    statusText.textContent = 'Not an Upwork job page';
    return;
  }

  // Ping the content script to verify it is alive
  try {
    const response = (await sendToContentScript(tab.id, {
      action: 'ping',
    })) as { isJobPage?: boolean } | undefined;

    if (response?.isJobPage) {
      statusIcon.className = 'status-icon ready';
      statusText.textContent = 'Upwork job page detected';
      btnAnalyze.disabled = false;
      btnSend.disabled = false;
      btnCopy.disabled = false;
    } else {
      statusIcon.className = 'status-icon error';
      statusText.textContent = 'Job page not detected on this tab';
    }
  } catch {
    // Content script may not be injected yet – try injecting via scripting API
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js'],
      });
      // Retry ping
      const response = (await sendToContentScript(tab.id, {
        action: 'ping',
      })) as { isJobPage?: boolean } | undefined;

      if (response?.isJobPage) {
        statusIcon.className = 'status-icon ready';
        statusText.textContent = 'Upwork job page detected';
        btnAnalyze.disabled = false;
        btnSend.disabled = false;
        btnCopy.disabled = false;
      } else {
        statusIcon.className = 'status-icon error';
        statusText.textContent = 'Not a recognised job page';
      }
    } catch {
      statusIcon.className = 'status-icon error';
      statusText.textContent = 'Cannot access this page';
    }
  }
}

// ---------------------------------------------------------------------------
// Button handlers
// ---------------------------------------------------------------------------

btnAnalyze.addEventListener('click', async () => {
  const tab = await getCurrentTab();
  if (!tab?.id) return;

  setLoading(true);
  try {
    const jobData = (await sendToContentScript(tab.id, {
      action: 'extract',
    })) as Record<string, unknown> | null;

    if (!jobData) {
      showMessage('Could not extract job data from this page.', 'error');
      return;
    }

    // Show preview
    jobTitlePreview.textContent = (jobData.title as string) || 'Untitled Job';
    jobPreview.classList.remove('hidden');

    // Send to dashboard for analysis
    try {
      const result = await sendToDashboard(jobData);
      showMessage('Job analyzed and sent to dashboard!', 'success');
      showScore(result);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
        showMessage('Dashboard not running. Start the server at localhost:3000.', 'error');
      } else {
        showMessage(`API Error: ${errMsg}`, 'error');
      }
    }
  } catch (err) {
    showMessage(
      `Extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      'error',
    );
  } finally {
    setLoading(false);
  }
});

btnSend.addEventListener('click', async () => {
  const tab = await getCurrentTab();
  if (!tab?.id) return;

  btnSend.disabled = true;
  btnSend.textContent = 'Sending...';

  try {
    const jobData = (await sendToContentScript(tab.id, {
      action: 'extract',
    })) as Record<string, unknown> | null;

    if (!jobData) {
      showMessage('Could not extract job data.', 'error');
      return;
    }

    const result = await sendToDashboard(jobData);

    // Open dashboard to the job detail
    const jobId = result.id ?? result.jobId ?? '';
    const dashUrl = jobId ? `${DASHBOARD_URL}/jobs/${jobId}` : DASHBOARD_URL;
    chrome.tabs.create({ url: dashUrl });

    showMessage('Sent to dashboard!', 'success');
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
      showMessage('Dashboard not running. Start the server at localhost:3000.', 'error');
    } else {
      showMessage(`Error: ${errMsg}`, 'error');
    }
  } finally {
    btnSend.disabled = false;
    btnSend.textContent = 'Send to Dashboard';
  }
});

btnCopy.addEventListener('click', async () => {
  const tab = await getCurrentTab();
  if (!tab?.id) return;

  btnCopy.disabled = true;
  try {
    const jobData = (await sendToContentScript(tab.id, {
      action: 'extract',
    })) as Record<string, unknown> | null;

    if (!jobData) {
      showMessage('Could not extract job data.', 'error');
      return;
    }

    const summary = formatJobSummary(jobData);
    await navigator.clipboard.writeText(summary);

    btnCopy.textContent = 'Copied!';
    showMessage('Job summary copied to clipboard.', 'success');
    setTimeout(() => {
      btnCopy.textContent = 'Copy Job Summary';
    }, 2000);
  } catch (err) {
    showMessage(`Copy failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
  } finally {
    btnCopy.disabled = false;
  }
});

btnDashboard.addEventListener('click', () => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});

// Kick off
init();
