/**
 * BFHL Graph Hierarchy Analyzer - Frontend Logic
 */

// ============================================
// DOM Elements
// ============================================
const dom = {
  dataInput: document.getElementById('dataInput'),
  charCount: document.getElementById('charCount'),
  btnClear: document.getElementById('btnClear'),
  btnExample: document.getElementById('btnExample'),
  btnSubmit: document.getElementById('btnSubmit'),
  apiUrl: document.getElementById('apiUrl'),
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  btnDismissError: document.getElementById('btnDismissError'),
  resultsContainer: document.getElementById('resultsContainer'),
  userId: document.getElementById('userId'),
  emailId: document.getElementById('emailId'),
  rollNumber: document.getElementById('rollNumber'),
  totalTrees: document.getElementById('totalTrees'),
  totalCycles: document.getElementById('totalCycles'),
  largestRoot: document.getElementById('largestRoot'),
  hierarchiesGrid: document.getElementById('hierarchiesGrid'),
  invalidSection: document.getElementById('invalidSection'),
  invalidList: document.getElementById('invalidList'),
  duplicateSection: document.getElementById('duplicateSection'),
  duplicateList: document.getElementById('duplicateList'),
  jsonToggle: document.getElementById('jsonToggle'),
  jsonChevron: document.getElementById('jsonChevron'),
  jsonOutput: document.getElementById('jsonOutput'),
};

// ============================================
// Example Data
// ============================================
const EXAMPLE_DATA = `A->B
A->C
B->D
B->E
C->F
X->Y
Y->Z
hello
A->B
M->N
N->M`;

// ============================================
// Event Listeners
// ============================================
dom.dataInput.addEventListener('input', updateCharCount);
dom.btnClear.addEventListener('click', clearInput);
dom.btnExample.addEventListener('click', loadExample);
dom.btnSubmit.addEventListener('click', handleSubmit);
dom.btnDismissError.addEventListener('click', dismissError);
dom.jsonToggle.addEventListener('click', toggleJsonView);

// ============================================
// Input Handlers
// ============================================
function updateCharCount() {
  const entries = parseInput(dom.dataInput.value);
  const count = entries.length;
  dom.charCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
}

function clearInput() {
  dom.dataInput.value = '';
  updateCharCount();
  dom.dataInput.focus();
}

function loadExample() {
  dom.dataInput.value = EXAMPLE_DATA;
  updateCharCount();
  dom.dataInput.focus();

  // Subtle flash animation
  dom.dataInput.style.borderColor = 'rgba(129, 140, 248, 0.5)';
  setTimeout(() => { dom.dataInput.style.borderColor = ''; }, 600);
}

/**
 * Parses the textarea input into an array of edge strings.
 * Supports both newline-separated and comma-separated entries.
 */
function parseInput(raw) {
  return raw
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// ============================================
// API Call
// ============================================
async function handleSubmit() {
  const entries = parseInput(dom.dataInput.value);

  if (entries.length === 0) {
    showError('Please enter at least one edge (e.g., "A->B").');
    return;
  }

  const apiUrl = dom.apiUrl.value.trim();
  if (!apiUrl) {
    showError('Please provide a valid API endpoint URL.');
    return;
  }

  // UI state: loading
  hideError();
  hideResults();
  showLoading();
  dom.btnSubmit.disabled = true;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: entries }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Server returned ${response.status}`);
    }

    const data = await response.json();
    renderResults(data);
  } catch (err) {
    const message = err.message.includes('Failed to fetch')
      ? 'Unable to reach the API. Make sure the backend is running and the URL is correct.'
      : err.message;
    showError(message);
  } finally {
    hideLoading();
    dom.btnSubmit.disabled = false;
  }
}

// ============================================
// UI State Management
// ============================================
function showLoading() {
  dom.loadingState.style.display = 'flex';
}

function hideLoading() {
  dom.loadingState.style.display = 'none';
}

function showError(message) {
  dom.errorMessage.textContent = message;
  dom.errorState.style.display = 'flex';
}

function hideError() {
  dom.errorState.style.display = 'none';
}

function dismissError() {
  hideError();
}

function hideResults() {
  dom.resultsContainer.style.display = 'none';
}

function toggleJsonView() {
  const isVisible = dom.jsonOutput.style.display !== 'none';
  dom.jsonOutput.style.display = isVisible ? 'none' : 'block';
  dom.jsonChevron.classList.toggle('open', !isVisible);
}

// ============================================
// Results Rendering
// ============================================
function renderResults(data) {
  // User info
  dom.userId.textContent = data.user_id || '—';
  dom.emailId.textContent = data.email_id || '—';
  dom.rollNumber.textContent = data.college_roll_number || '—';

  // Summary
  const summary = data.summary || {};
  animateCountUp(dom.totalTrees, summary.total_trees || 0);
  animateCountUp(dom.totalCycles, summary.total_cycles || 0);
  dom.largestRoot.textContent = summary.largest_tree_root || '—';

  // Hierarchies
  renderHierarchies(data.hierarchies || []);

  // Invalid entries
  if (data.invalid_entries && data.invalid_entries.length > 0) {
    dom.invalidSection.style.display = 'block';
    dom.invalidList.innerHTML = data.invalid_entries
      .map(e => `<span class="tag tag-invalid">${escapeHtml(e)}</span>`)
      .join('');
  } else {
    dom.invalidSection.style.display = 'none';
  }

  // Duplicate edges
  if (data.duplicate_edges && data.duplicate_edges.length > 0) {
    dom.duplicateSection.style.display = 'block';
    dom.duplicateList.innerHTML = data.duplicate_edges
      .map(e => `<span class="tag tag-duplicate">${escapeHtml(e)}</span>`)
      .join('');
  } else {
    dom.duplicateSection.style.display = 'none';
  }

  // Raw JSON
  dom.jsonOutput.textContent = JSON.stringify(data, null, 2);
  dom.jsonOutput.style.display = 'none';
  dom.jsonChevron.classList.remove('open');

  // Show results
  dom.resultsContainer.style.display = 'flex';

  // Scroll to results
  setTimeout(() => {
    dom.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * Renders hierarchy cards into the grid.
 */
function renderHierarchies(hierarchies) {
  dom.hierarchiesGrid.innerHTML = '';

  if (hierarchies.length === 0) {
    dom.hierarchiesGrid.innerHTML = `
      <div class="hierarchy-card glass-card" style="padding: 2rem; text-align: center;">
        <p style="color: var(--text-tertiary);">No hierarchies to display.</p>
      </div>`;
    return;
  }

  hierarchies.forEach((h, i) => {
    const isCycle = !!h.has_cycle;
    const card = document.createElement('div');
    card.className = `hierarchy-card ${isCycle ? 'cycle-card' : 'tree-card'}`;
    card.style.animationDelay = `${i * 80}ms`;

    card.innerHTML = `
      <div class="hierarchy-header">
        <div class="hierarchy-root">
          <div class="root-node">${escapeHtml(h.root)}</div>
          <div class="root-info">
            <h4>Root: ${escapeHtml(h.root)}</h4>
            <span class="root-label">${isCycle ? 'Cyclic Group' : 'Tree Hierarchy'}</span>
          </div>
        </div>
        <div class="hierarchy-badges">
          ${isCycle
            ? '<span class="badge badge-cycle">Cycle</span>'
            : `<span class="badge badge-tree">Tree</span>
               <span class="badge badge-depth">Depth: ${h.depth}</span>`
          }
        </div>
      </div>
      <div class="hierarchy-body">
        ${isCycle ? renderCycleBody() : renderTreeView(h.tree, h.root)}
      </div>`;

    dom.hierarchiesGrid.appendChild(card);
  });
}

/**
 * Renders cycle body message.
 */
function renderCycleBody() {
  return `
    <div class="cycle-message">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
        <path d="M10 6V10M10 13H10.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>A cycle was detected in this group. Tree structure cannot be built.</span>
    </div>`;
}

/**
 * Renders a nested tree view using HTML structural elements (ul/li).
 */
function renderTreeView(tree, rootName) {
  return `<div class="css-tree-view">${renderTreeLevel(tree, true)}</div>`;
}

function renderTreeLevel(obj, isRootLevel) {
  const keys = Object.keys(obj);
  if (keys.length === 0) return '';
  
  let html = isRootLevel ? '<ul class="tree-root">' : '<ul>';
  
  keys.forEach((key) => {
    const children = obj[key];
    const hasChildren = Object.keys(children).length > 0;
    
    // Determine label class
    let labelClass = 'tree-node-label';
    if (isRootLevel && keys.length === 1) labelClass += ' root-label-node';
    else if (!hasChildren) labelClass += ' leaf-label';

    const rootText = isRootLevel ? ' (root)' : '';
    const leafText = (!hasChildren && !isRootLevel) ? ' ○' : '';

    html += `<li>`;
    html += `<div class="tree-node-content"><span class="${labelClass}">${escapeHtml(key)}${rootText}${leafText}</span></div>`;
    if (hasChildren) {
      html += renderTreeLevel(children, false);
    }
    html += `</li>`;
  });
  
  html += '</ul>';
  return html;
}

// ============================================
// Utilities
// ============================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function animateCountUp(element, target) {
  const duration = 600;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Initialize
updateCharCount();
