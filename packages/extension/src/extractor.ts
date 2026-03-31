// ---------------------------------------------------------------------------
// Upwork Job Page Data Extractor
// ---------------------------------------------------------------------------
// Extracts structured job data from the current Upwork job-detail page DOM.
// Every individual field extraction is wrapped in try/catch so a single
// selector change never breaks the whole extraction.
// ---------------------------------------------------------------------------

export interface ExtractedJobData {
  title: string;
  description: string;
  clientCountry?: string;
  paymentVerified?: boolean;
  budget?: string;
  budgetAmount?: number;
  jobType?: 'hourly' | 'fixed';
  hourlyRange?: string;
  experienceLevel?: string;
  estimatedDuration?: string;
  projectType?: string;
  category?: string;
  clientHireRate?: string;
  clientTotalSpent?: string;
  clientHires?: number;
  proposalCount?: string;
  skills: string[];
  postedTime?: string;
  screeningQuestions?: string[];
  connectsRequired?: string;
  url?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Try multiple CSS selectors in order, return the trimmed textContent of the
 *  first match or undefined. */
function getTextBySelector(selectors: string[]): string | undefined {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) {
        return el.textContent.trim();
      }
    } catch {
      // invalid selector – skip
    }
  }
  return undefined;
}

/** Search the page for a label (case-insensitive substring match on
 *  textContent) then return the text of the closest following sibling or
 *  parent's next element. */
function getTextByLabel(label: string): string | undefined {
  try {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
    const lowerLabel = label.toLowerCase();
    let node: Node | null = walker.currentNode;
    while (node) {
      const el = node as HTMLElement;
      const text = el.textContent?.trim().toLowerCase() ?? '';
      // Match elements whose *own* direct text (not children) contains label
      if (
        el.childNodes.length <= 3 &&
        text.includes(lowerLabel) &&
        text.length < lowerLabel.length + 60
      ) {
        // Try next sibling
        const sibling = el.nextElementSibling;
        if (sibling?.textContent?.trim()) {
          return sibling.textContent.trim();
        }
        // Try parent's next sibling
        const parentSibling = el.parentElement?.nextElementSibling;
        if (parentSibling?.textContent?.trim()) {
          return parentSibling.textContent.trim();
        }
      }
      node = walker.nextNode();
    }
  } catch {
    // ignore
  }
  return undefined;
}

/** Extract the first number (int or float) from a string. */
function extractNumber(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const match = text.replace(/,/g, '').match(/[\d]+(?:\.[\d]+)?/);
  return match ? parseFloat(match[0]) : undefined;
}

/** Return all non-empty trimmed textContent values for a list of selectors. */
function getAllTextsBySelector(selectors: string[]): string[] {
  const results: string[] = [];
  for (const sel of selectors) {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        const t = el.textContent?.trim();
        if (t) results.push(t);
      });
      if (results.length > 0) return results;
    } catch {
      // skip
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Page detection
// ---------------------------------------------------------------------------

export function isUpworkJobPage(): boolean {
  const url = window.location.href;
  const urlMatch =
    url.includes('upwork.com/jobs/') ||
    url.includes('upwork.com/freelance-jobs/') ||
    url.includes('upwork.com/ab/proposals/job/');

  if (!urlMatch) return false;

  // Additional sanity: look for a recognisable job-page element
  const hasJobContent =
    !!document.querySelector('[data-test="job-title"]') ||
    !!document.querySelector('.job-details-card') ||
    !!document.querySelector('.up-card-header h4') ||
    !!document.querySelector('[class*="job-details"]') ||
    !!document.querySelector('h4');

  return hasJobContent;
}

// ---------------------------------------------------------------------------
// Main extractor
// ---------------------------------------------------------------------------

export function extractJobData(): ExtractedJobData | null {
  if (!isUpworkJobPage()) return null;

  const data: ExtractedJobData = {
    title: '',
    description: '',
    skills: [],
  };

  // -- Title ---------------------------------------------------------------
  try {
    data.title =
      getTextBySelector([
        '[data-test="job-title"]',
        'h4.job-details-card__title',
        '.job-details-card header h4',
        '.up-card-header h4',
        'h1.h4',
        'header h4',
        'h1',
      ]) ?? document.title.replace(/ \| Upwork.*$/, '').trim();
  } catch {
    data.title = document.title;
  }

  // -- Description ---------------------------------------------------------
  try {
    const descEl =
      document.querySelector('[data-test="job-description"]') ||
      document.querySelector('.job-description') ||
      document.querySelector('[class*="job-description"]') ||
      document.querySelector('.up-card-section .text-body') ||
      document.querySelector('.break.text-body');

    if (descEl) {
      data.description = descEl.textContent?.trim() ?? '';
    }
  } catch {
    // leave empty
  }

  // -- Client country ------------------------------------------------------
  try {
    data.clientCountry =
      getTextBySelector([
        '[data-test="client-country"]',
        '.client-location',
        '[class*="client-location"]',
      ]) ||
      getTextByLabel('Location') ||
      getTextByLabel('Client Location');
  } catch {
    // skip
  }

  // -- Payment verified ----------------------------------------------------
  try {
    const pageText = document.body.innerText.toLowerCase();
    if (pageText.includes('payment verified') || pageText.includes('payment method verified')) {
      data.paymentVerified = true;
    } else {
      // Check for verification badge icon
      const badge =
        document.querySelector('[data-test="payment-verified"]') ||
        document.querySelector('[aria-label*="payment verified" i]') ||
        document.querySelector('.text-muted.nowrap svg');
      data.paymentVerified = !!badge;
    }
  } catch {
    // skip
  }

  // -- Budget / Job type ---------------------------------------------------
  try {
    const budgetText =
      getTextBySelector([
        '[data-test="budget"]',
        '[data-test="job-budget"]',
        '[class*="budget"]',
      ]) ||
      getTextByLabel('Budget') ||
      getTextByLabel('Est. Budget');

    if (budgetText) {
      data.budget = budgetText;
      data.budgetAmount = extractNumber(budgetText);
    }

    // Detect job type
    const pageText = document.body.innerText;
    if (/hourly/i.test(pageText.slice(0, 3000))) {
      data.jobType = 'hourly';
      // Try to find hourly range
      const hourlyMatch = pageText.match(/\$[\d,.]+\s*-\s*\$[\d,.]+\s*\/?\s*h(?:ou)?r/i);
      if (hourlyMatch) {
        data.hourlyRange = hourlyMatch[0].trim();
      } else {
        const rangeText =
          getTextBySelector(['[data-test="hourly-rate"]', '[data-test="job-hourly-rate"]']) ||
          getTextByLabel('Hourly Range');
        if (rangeText) data.hourlyRange = rangeText;
      }
    } else if (/fixed.price/i.test(pageText.slice(0, 3000))) {
      data.jobType = 'fixed';
    }
  } catch {
    // skip
  }

  // -- Experience level ----------------------------------------------------
  try {
    const expText =
      getTextBySelector(['[data-test="experience-level"]', '[class*="experience-level"]']) ||
      getTextByLabel('Experience Level') ||
      getTextByLabel('Experience');

    if (expText) {
      data.experienceLevel = expText;
    } else {
      // Fallback: scan for keywords
      const pageText = document.body.innerText;
      const expMatch = pageText.match(/\b(Entry Level|Intermediate|Expert)\b/i);
      if (expMatch) data.experienceLevel = expMatch[1];
    }
  } catch {
    // skip
  }

  // -- Estimated duration --------------------------------------------------
  try {
    data.estimatedDuration =
      getTextBySelector(['[data-test="duration"]', '[data-test="job-duration"]']) ||
      getTextByLabel('Project Length') ||
      getTextByLabel('Duration') ||
      getTextByLabel('Estimated time');
  } catch {
    // skip
  }

  // -- Project type / size -------------------------------------------------
  try {
    data.projectType =
      getTextBySelector(['[data-test="project-type"]']) || getTextByLabel('Project Type');
  } catch {
    // skip
  }

  // -- Category ------------------------------------------------------------
  try {
    data.category =
      getTextBySelector(['[data-test="job-category"]', '[class*="job-category"]']) ||
      getTextByLabel('Category');
  } catch {
    // skip
  }

  // -- Client hire rate ----------------------------------------------------
  try {
    const hireRateText =
      getTextBySelector(['[data-test="hire-rate"]']) ||
      getTextByLabel('Hire Rate') ||
      getTextByLabel('hire rate');

    if (hireRateText) {
      data.clientHireRate = hireRateText;
    } else {
      const match = document.body.innerText.match(/(\d{1,3})%\s*hire\s*rate/i);
      if (match) data.clientHireRate = match[0];
    }
  } catch {
    // skip
  }

  // -- Client total spent --------------------------------------------------
  try {
    const spentText =
      getTextBySelector(['[data-test="total-spent"]']) ||
      getTextByLabel('Total Spent') ||
      getTextByLabel('total spent');

    if (spentText) {
      data.clientTotalSpent = spentText;
    } else {
      const match = document.body.innerText.match(/\$[\d,.]+[KkMm]?\+?\s*(?:total\s*)?spent/i);
      if (match) data.clientTotalSpent = match[0].replace(/spent/i, '').trim();
    }
  } catch {
    // skip
  }

  // -- Client hires --------------------------------------------------------
  try {
    const hiresText = getTextBySelector(['[data-test="total-hires"]']) || getTextByLabel('Hires');

    if (hiresText) {
      data.clientHires = extractNumber(hiresText);
    } else {
      const match = document.body.innerText.match(/(\d+)\s*hires/i);
      if (match) data.clientHires = parseInt(match[1], 10);
    }
  } catch {
    // skip
  }

  // -- Proposal count ------------------------------------------------------
  try {
    const proposalText =
      getTextBySelector(['[data-test="proposals"]', '[data-test="proposal-count"]']) ||
      getTextByLabel('Proposals') ||
      getTextByLabel('proposals');

    if (proposalText) {
      data.proposalCount = proposalText;
    } else {
      const match = document.body.innerText.match(
        /(Less than \d+|\d+\s*to\s*\d+|\d+\+?)\s*proposals/i,
      );
      if (match) data.proposalCount = match[1];
    }
  } catch {
    // skip
  }

  // -- Skills / tags -------------------------------------------------------
  try {
    const skillTexts = getAllTextsBySelector([
      '[data-test="skill"] span',
      '[data-test="skill"]',
      '.up-skill-badge',
      '.air3-token',
      '[class*="skill-badge"]',
      '.skills-list .badge',
    ]);
    data.skills = [...new Set(skillTexts.filter(Boolean))];
  } catch {
    // skip
  }

  // -- Posted time ---------------------------------------------------------
  try {
    data.postedTime =
      getTextBySelector(['[data-test="posted-on"]', '[data-test="job-posted-on"]', 'time']) ||
      getTextByLabel('Posted');
  } catch {
    // skip
  }

  // -- Screening questions -------------------------------------------------
  try {
    const questions: string[] = [];

    // Strategy 1: dedicated test selectors
    document.querySelectorAll('[data-test="screening-question"]').forEach((el) => {
      const t = el.textContent?.trim();
      if (t) questions.push(t);
    });

    // Strategy 2: ordered list inside a "screening" or "additional" section
    if (questions.length === 0) {
      const headings = document.querySelectorAll('h3, h4, h5, strong');
      headings.forEach((h) => {
        if (/screening|additional questions/i.test(h.textContent ?? '')) {
          const list =
            h.closest('section')?.querySelectorAll('li') || h.parentElement?.querySelectorAll('li');
          list?.forEach((li) => {
            const t = li.textContent?.trim();
            if (t) questions.push(t);
          });
        }
      });
    }

    if (questions.length > 0) {
      data.screeningQuestions = questions;
    }
  } catch {
    // skip
  }

  // -- Connects required ---------------------------------------------------
  try {
    const connectsText =
      getTextBySelector(['[data-test="connects"]']) ||
      getTextByLabel('Connects to submit') ||
      getTextByLabel('Connects');

    if (connectsText) {
      data.connectsRequired = connectsText;
    } else {
      const match = document.body.innerText.match(/(\d+)\s*connects?\s*(?:to submit|required)/i);
      if (match) data.connectsRequired = match[1];
    }
  } catch {
    // skip
  }

  // -- URL -----------------------------------------------------------------
  try {
    data.url = window.location.href;
  } catch {
    // skip
  }

  // Validate: at minimum we need a title or description
  if (!data.title && !data.description) return null;

  return data;
}
