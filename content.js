
/**
 * Clears any highlights or outlines added to images.
 */
function clearHighlights() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.style.outline = '';
    img.style.boxShadow = '';
    img.removeAttribute('title');
  });
}

/**
 * Audits images for SEO best practices.
 * @param {boolean} showHighlights - Whether to highlight images with issues
*/
function runAudit(showHighlights) {
  if (!showHighlights) clearHighlights();

  const images = [...document.querySelectorAll('img')];
  const resources = performance.getEntriesByType('resource');

  /**
   * Audits a single image for SEO best practices.
   * @param {HTMLElement} img - The image element to audit
   * @returns {Object} - An object containing the image's properties
   */
  const results = images.map((img) => {
    const src = img.currentSrc || img.src;
    const isLazy = img.loading === 'lazy';
    const hasAlt = img.hasAttribute('alt');
    const alt = img.getAttribute('alt') || '';
    const usesSrcset = img.hasAttribute('srcset');
    const cdnUsed = /cloudflare|cdn|bunny/.test(src);
    const {length, [length - 1]: imgName} = img.src.split('/');

    const resource = resources.find(r => r.name === src);
    const sizeKB = resource ? Math.round(resource.transferSize / 1024) : null;

    const issues = [];

    if (!hasAlt) {
      if (showHighlights) img.style.outline = '3px solid red';
      img.title = 'Missing alt attribute';
      issues.push('Missing alt');
    } else if (img.alt === imgName) {
      if (showHighlights) img.style.outline = '3px solid red';
      img.title = 'Alt attribute should be descriptive';
      issues.push('Alt is same as src');
    } else if (img.alt == '') {
      if (showHighlights) img.style.outline = '3px solid red';
      img.title = 'Empty alt attribute';
      issues.push('Empty alt');
    }

    if (!isLazy) {
      if (showHighlights) img.style.boxShadow = '0 0 0 3px orange';
      img.title += '\nNo lazy loading';
      issues.push('No lazy loading');
    }

    if (!usesSrcset) {
      if (showHighlights) img.style.boxShadow = '0 0 0 3px purple';
      img.title += '\nNo responsive image (srcset)';
      issues.push('No srcset');
    }

    if (sizeKB !== null && sizeKB > 200) {
      issues.push(`File size too large (${sizeKB} KB)`);
    }

    return {
      src,
      alt,
      isLazy,
      usesSrcset,
      cdnUsed,
      width: img.naturalWidth,
      height: img.naturalHeight,
      sizeKB,
      issues
    };
  });

  chrome.runtime.sendMessage({ type: 'SEO_AUDIT_RESULTS', payload: results });
}

/**
 * Handles messages from the popup.
 * @param {Object} msg - The message object
 * @param {string} msg.type - The type of message
 * @param {boolean} msg.showHighlights - Whether to highlight images with issues
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'RUN_AUDIT') {
    runAudit(msg.showHighlights);
  }
});
