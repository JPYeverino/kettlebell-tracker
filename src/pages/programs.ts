import type { Program, RPELevel } from '../types';

const programs: Program[] = [
  {
    id: 'c_and_p',
    name: 'Clean & Press (C&P)',
    role: 'Main strength / muscle-preservation engine',
    frequency: '2×/week',
    description: 'Primary strength work using Wildman ladder progression',
    details: [
      'Start at 16 kg for ladders',
      'Progress: 3×(3-2-1) → 4×(3-2-1) → 5×(3-2-1) → 3×(4-3-2-1)',
      'Target RPE: 7-8',
      'Always done first in session on its days',
    ],
  },
  {
    id: 'snatch',
    name: 'Snatch EMOM',
    role: 'Primary conditioning / calorie burn',
    frequency: '2×/week (non-consecutive)',
    description: 'Every Minute On the Minute (EMOM) protocol for metabolic conditioning',
    details: [
      'Load: ≈40-60% of C&P bell',
      'Progression: Volume cycles (more minutes) → density cycles (more reps/min) → heavier bell',
      'Target RPE: 7-8 (breathing hard but technique crisp)',
      'Optional light top-up once more if recovered',
    ],
  },
  {
    id: 'tgu',
    name: 'Turkish Get-Up (TGU)',
    role: 'Skill, stability, accessory strength',
    frequency: '1-2×/week',
    description: 'Levels 1-5 deconstructed plus full TGUs',
    details: [
      'Structure: 28 min, 30s work / 30s rest across 4 rounds × 7 exercises',
      'Full TGUs: 3-5×1-3/side with moderate bell (RPE 7-8)',
      'Emphasis: Control > load',
      'Supports heavy C&P and snatch work',
    ],
  },
  {
    id: 'clubs',
    name: 'Single-Arm Club',
    role: 'Skill / joint health / rotational strength',
    frequency: '1×/week',
    description: 'Light skill work for shoulder and wrist conditioning',
    details: [
      'Intensity: Light-moderate (RPE 5-7)',
      'Duration: 20-30 min',
      'Priority: Accessory - keep easy enough not to interfere with recovery',
    ],
  },
  {
    id: 'legs',
    name: 'Leg Work',
    role: 'Strength & longevity',
    frequency: 'Integrated with other days',
    description: 'Heavy bilateral and unilateral leg training',
    details: [
      'Heavy bilateral: Goblet or front-rack squat (same day as heavy C&P)',
      'Volume: 3-4×6-10 at RPE 7-8',
      'Load: Currently ~20 kg; progress when 4×8 feels solid',
      'Unilateral: Reverse lunge or Bulgarian split squat (same day as TGU)',
      'Volume: 2-3×8-12/leg at RPE 7',
      'Load: Start with 16-20 kg; add reps then weight',
    ],
  },
  {
    id: 'abs',
    name: '5-Minute Ab Program',
    role: 'Daily core variation for resilience and transfer',
    frequency: 'Up to 5×/week',
    description: 'Rotating core movements to build trunk strength and reduce injury risk',
    details: [
      'Duration: 5 minutes per session',
      'Tacked on after main work',
      'Rotates core movements for complete trunk engagement',
      'Supports lifting performance and athletic movement patterns',
    ],
  },
];

const rpeGuide: RPELevel[] = [
  { level: 10, label: 'Max', description: 'No reps left' },
  { level: 9, label: 'Very hard', description: '≈1 rep in reserve' },
  { level: 8, label: 'Hard', description: '≈2 reps in reserve (target for strength)' },
  { level: 7, label: 'Challenging', description: '≈3 reps in reserve (good for progression, legs, skill)' },
  { level: 6, label: 'Moderate', description: 'Warm-ups / technique' },
];

const schedule = [
  { day: 'Day 1', name: 'Heavy C&P + Squats', type: 'Strength Anchor', details: 'C&P day A + Goblet/front-rack squats 3-4×6-10' },
  { day: 'Day 2', name: 'Snatch EMOM', type: 'Main Conditioning', details: 'Snatch EMOM volume/density workout' },
  { day: 'Day 3', name: 'TGU + Unilateral Legs', type: 'Skill + Legs', details: 'TGU Level session (28-min) + reverse lunges/split squats' },
  { day: 'Day 4', name: 'C&P Volume', type: 'Second Strength', details: 'C&P day B + optional light squats/RDLs' },
  { day: 'Day 5', name: 'Clubs + Light Work', type: 'Skill + Optional', details: 'Single-arm clubs + optional short snatch EMOM if fresh' },
  { day: 'Days 6-7', name: 'Rest', type: 'Recovery', details: 'Walking, mobility, sleep' },
];

export function renderPrograms(container: HTMLElement) {
  container.innerHTML = `
    <div class="program-library">
      <h2>Program Library</h2>
      <p class="subtitle">Your complete kettlebell fat-loss & strength program</p>

      <section class="section">
        <h3>Core Programs</h3>
        <div class="programs-grid">
          ${programs.map(p => `
            <div class="program-card">
              <div class="program-header">
                <h4>${p.name}</h4>
                <span class="frequency">${p.frequency}</span>
              </div>
              <p class="role">${p.role}</p>
              <p class="description">${p.description}</p>
              <ul class="details">
                ${p.details.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="section">
        <h3>RPE Guide</h3>
        <div class="rpe-table">
          ${rpeGuide.map(r => `
            <div class="rpe-row">
              <div class="rpe-level">RPE ${r.level}</div>
              <div class="rpe-label">${r.label}</div>
              <div class="rpe-description">${r.description}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="section">
        <h3>Weekly Schedule</h3>
        <div class="schedule">
          ${schedule.map(s => `
            <div class="schedule-day">
              <div class="schedule-header">
                <strong>${s.day}</strong>
                <span class="schedule-type">${s.type}</span>
              </div>
              <div class="schedule-name">${s.name}</div>
              <div class="schedule-details">${s.details}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="section">
        <h3>Progression Rules</h3>
        <ul class="progression-list">
          <li><strong>C&P:</strong> Follow ladder steps. Move up when current step completes with good form at RPE ≤8</li>
          <li><strong>Squats:</strong> When 4×8 at RPE ≤7-8 twice, add weight or reps</li>
          <li><strong>Unilateral legs:</strong> Build to 3×12/leg, then increase weight and drop to 2×8-10</li>
          <li><strong>Snatch:</strong> Add minutes → reps/min → weight</li>
          <li><strong>TGU & Clubs:</strong> Progress slowly—more reps or heavier bell only when technique is rock-solid</li>
        </ul>
      </section>
    </div>
  `;
}
