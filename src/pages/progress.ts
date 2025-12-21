import { supabase } from '../lib/supabase';
import type { BodyFatEntry } from '../types';

let entries: BodyFatEntry[] = [];
let showForm = false;
const targetBF = 28;

export function renderProgress(container: HTMLElement) {
  loadEntries().then(() => render(container));
}

async function loadEntries() {
  const { data } = await supabase
    .from('body_fat_entries')
    .select('*')
    .order('measurement_date', { ascending: true });
  if (data) entries = data;
}

async function deleteEntry(id: string) {
  if (!confirm('Delete this entry?')) return;
  await supabase.from('body_fat_entries').delete().eq('id', id);
  await loadEntries();
}

function render(container: HTMLElement) {
  const currentBF = entries.length > 0 ? entries[entries.length - 1].body_fat_percent : null;
  const startBF = entries.length > 0 ? entries[0].body_fat_percent : null;
  const progress = currentBF && startBF ? ((startBF - currentBF) / (startBF - targetBF)) * 100 : 0;

  container.innerHTML = `
    <div class="body-fat-tracker">
      <div class="tracker-header">
        <div>
          <h2>Body Fat Progress</h2>
          <p class="subtitle">Track progress toward 28% goal</p>
        </div>
        <button id="toggle-form-btn" class="btn-add">${showForm ? 'Cancel' : '+ Add Entry'}</button>
      </div>

      ${currentBF !== null ? `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Current</div>
            <div class="stat-value">${currentBF.toFixed(1)}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Target</div>
            <div class="stat-value">${targetBF}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">To Go</div>
            <div class="stat-value">${Math.max(0, currentBF - targetBF).toFixed(1)}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Progress</div>
            <div class="stat-value">${Math.max(0, Math.min(100, progress)).toFixed(0)}%</div>
          </div>
        </div>
      ` : ''}

      ${showForm ? `
        <form id="entry-form" class="entry-form">
          <div class="form-row">
            <div class="form-group">
              <label for="date">Date</label>
              <input id="date" type="date" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
            <div class="form-group">
              <label for="percentage">Body Fat %</label>
              <input id="percentage" type="number" step="0.1" placeholder="e.g., 33.5" required />
            </div>
          </div>
          <div class="form-group">
            <label for="notes">Notes (optional)</label>
            <input id="notes" type="text" placeholder="How you're feeling, measurement method, etc." />
          </div>
          <div id="form-error" class="error-message" style="display: none;"></div>
          <button type="submit" class="btn-primary">Save Entry</button>
        </form>
      ` : ''}

      ${entries.length > 0 ? `
        <div class="chart-section">
          <h3>Progress Chart</h3>
          <div class="chart-container">
            <canvas id="chart-canvas" class="chart-canvas"></canvas>
          </div>
        </div>

        <div class="entries-section">
          <h3>All Entries</h3>
          <div class="entries-list">
            ${entries.slice().reverse().map(e => `
              <div class="entry-item" data-id="${e.id}">
                <div class="entry-main">
                  <div class="entry-date">${new Date(e.measurement_date).toLocaleDateString()}</div>
                  <div class="entry-percent">${e.body_fat_percent.toFixed(1)}%</div>
                </div>
                ${e.notes ? `<div class="entry-notes">${e.notes}</div>` : ''}
                <button class="btn-delete" data-id="${e.id}">Delete</button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : !showForm ? `
        <div class="empty-state">
          <p>No entries yet. Add your first measurement to start tracking progress.</p>
        </div>
      ` : ''}
    </div>
  `;

  // Attach listeners
  const toggleBtn = document.getElementById('toggle-form-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      showForm = !showForm;
      render(container);
    });
  }

  const form = document.getElementById('entry-form') as HTMLFormElement | null;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('form-error')!;
      errorDiv.style.display = 'none';

      const date = (document.getElementById('date') as HTMLInputElement).value;
      const percentage = parseFloat((document.getElementById('percentage') as HTMLInputElement).value);
      const notes = (document.getElementById('notes') as HTMLInputElement).value;

      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        errorDiv.textContent = 'Please enter a valid percentage (0-100)';
        errorDiv.style.display = 'block';
        return;
      }

      const { error } = await supabase.from('body_fat_entries').insert({
        measurement_date: date,
        body_fat_percent: percentage,
        notes: notes || null,
      });

      if (error) {
        errorDiv.textContent = error.code === '23505'
          ? 'Entry already exists for this date'
          : error.message;
        errorDiv.style.display = 'block';
      } else {
        showForm = false;
        await loadEntries();
        render(container);
      }
    });
  }

  container.querySelectorAll<HTMLButtonElement>('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteEntry(btn.dataset.id!);
      render(container);
    });
  });

  // Draw chart
  if (entries.length > 0) {
    drawChart();
  }
}

function drawChart() {
  const canvas = document.getElementById('chart-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const values = entries.map(e => e.body_fat_percent);
  const allValues = [...values, targetBF];
  const minY = Math.floor(Math.min(...allValues) - 1);
  const maxY = Math.ceil(Math.max(...allValues) + 1);

  const getX = (i: number) => padding.left + (i / (entries.length - 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  // Grid
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (i / 5) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Y labels
  ctx.fillStyle = '#999';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 5; i++) {
    const value = maxY - (i / 5) * (maxY - minY);
    const y = padding.top + (i / 5) * chartHeight;
    ctx.fillText(value.toFixed(1) + '%', padding.left - 10, y);
  }

  // Target line
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  const targetY = getY(targetBF);
  ctx.beginPath();
  ctx.moveTo(padding.left, targetY);
  ctx.lineTo(padding.left + chartWidth, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Data line
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  entries.forEach((entry, i) => {
    const x = getX(i);
    const y = getY(entry.body_fat_percent);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Data points
  ctx.fillStyle = '#fff';
  entries.forEach((entry, i) => {
    const x = getX(i);
    const y = getY(entry.body_fat_percent);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // X labels
  ctx.fillStyle = '#999';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  entries.forEach((entry, i) => {
    if (entries.length <= 7 || i % Math.ceil(entries.length / 7) === 0 || i === entries.length - 1) {
      const x = getX(i);
      const date = new Date(entry.measurement_date);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      ctx.fillText(label, x, padding.top + chartHeight + 10);
    }
  });
}
