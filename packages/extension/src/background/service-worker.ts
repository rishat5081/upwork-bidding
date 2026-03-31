// ---------------------------------------------------------------------------
// Upwork Bidder – Background Service Worker
// ---------------------------------------------------------------------------
// Minimal service worker. No polling, no alarms, no background fetching.
// Only handles extension lifecycle events and optional message relay.
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.warn('[Upwork Bidder] Extension installed.');
  } else if (details.reason === 'update') {
    console.warn(`[Upwork Bidder] Extension updated to v${chrome.runtime.getManifest().version}.`);
  }
});

// ---------------------------------------------------------------------------
// Message relay – forward messages between popup and content scripts when
// direct communication is not possible (e.g. across different contexts).
// Currently this is a pass-through; popup communicates directly with content
// scripts via chrome.tabs.sendMessage.
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (
    message: { target?: string; action?: string; tabId?: number },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    // Relay to a specific tab's content script if requested
    if (message.target === 'content' && message.tabId && message.action) {
      chrome.tabs
        .sendMessage(message.tabId, { action: message.action })
        .then(sendResponse)
        .catch((err) => {
          console.warn('[Upwork Bidder] Relay failed:', err);
          sendResponse({ error: err.message });
        });
      return true; // async sendResponse
    }

    return false;
  },
);
