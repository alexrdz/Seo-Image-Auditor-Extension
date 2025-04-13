/**
 * Sends a message to the active tab to run an audit.
 * @param {boolean} showHighlights - Whether to highlight images with issues
 */
function sendAuditRequest(showHighlights) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'RUN_AUDIT',
      showHighlights
    });
  });
}

/**
 * Handles changes to the checkbox.
 * @param {Event} e - The event object
 */
document.getElementById('toggleHighlights').addEventListener('change', (e) => {
  sendAuditRequest(e.target.checked);
});

/**
 * Handles messages from the content script.
 * @param {Object} msg - The message object
 * @param {string} msg.type - The type of message
 * @param {Array} msg.payload - The payload of the message
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SEO_AUDIT_RESULTS') {
    const container = document.getElementById('results');
    container.innerHTML = '';
    msg.payload.forEach((img, i) => {
      // if ((!img.issues || img.issues.length === 0)) return;

      const el = document.createElement('div');
      el.innerHTML = `
        <div class="stack">
        <strong>Image ${i + 1}</strong><br/>
        <span class="${img.alt ? 'valid' : 'invalid'}">Alt: ${img.alt || '&times; Missing'}</span><br/>
        <span class="${img.isLazy ? 'valid' : 'invalid'}">Lazy: ${img.isLazy ? 'Yes' : '&times; No'}</span><br/>
        <span class="${img.usesSrcset ? 'valid' : 'invalid'}">Srcset: ${img.usesSrcset ? 'Yes' : '&times; No'}</span><br/>
        <span class="${img.cdnUsed ? 'valid' : 'invalid'}">CDN: ${img.cdnUsed ? 'Yes' : '&times; No'}</span><br/>
        <span class="${img.sizeKB ? 'valid' : 'invalid'}">Size: ${img.sizeKB ? img.sizeKB + 'Kb' : '&times; Missing'}</span><br/>
        </div>
        <hr/>
        `;
      container.appendChild(el);
    });
  }
});
