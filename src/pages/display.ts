import { supabase } from '../lib/supabase';
import type { PlannedWorkout } from '../types';
import type { User } from '@supabase/supabase-js';
import { formatWeekStart } from '../lib/weekUtils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WORKOUT_OPTIONS: { [key: string]: string } = {
  'c_and_p': 'Clean & Press',
  'snatch': 'Snatch EMOM',
  'tgu': 'Turkish Get-Up',
  'clubs': 'Single-Arm Clubs',
  'legs': 'Leg Work',
  'abs': '5-Min Abs',
  'rest': 'Rest',
};

let workouts: PlannedWorkout[] = [];
let currentUser: User | null = null;

export function renderDisplay(container: HTMLElement, user: User) {
  currentUser = user;
  loadPlan().then(() => render(container));

  // Auto-refresh every 5 minutes
  setInterval(() => {
    loadPlan().then(() => render(container));
  }, 5 * 60 * 1000);
}

async function loadPlan() {
  if (!currentUser) return;

  const currentWeek = formatWeekStart(new Date());

  // Get active plan for this user
  const { data: plans } = await supabase
    .from('workout_plans')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('is_active', true)
    .limit(1);

  if (!plans || plans.length === 0) return;

  const { data } = await supabase
    .from('planned_workouts')
    .select('*')
    .eq('plan_id', plans[0].id)
    .eq('week_start_date', currentWeek);

  if (data) {
    workouts = data;
  }
}

function getWorkouts(dayOfWeek: number): PlannedWorkout[] {
  return workouts.filter(w => w.day_of_week === dayOfWeek) || [];
}

function render(container: HTMLElement) {
  const today = new Date().getDay();

  container.innerHTML = `
    <div class="display-view">
      <header class="display-header">
        <h1>Weekly Workout Plan</h1>
        <div class="display-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </header>

      <div class="display-grid">
        ${DAYS.map((day, i) => {
          // Adjust for Monday-based week (0=Mon, 6=Sun)
          const dayOfWeek = i === 6 ? 0 : i + 1;
          const dayWorkouts = getWorkouts(dayOfWeek);
          const isToday = dayOfWeek === today;

          return `
            <div class="display-day ${isToday ? 'display-today' : ''}">
              <div class="display-day-name">${day}</div>
              ${dayWorkouts.length === 0 ? '<div class="display-empty">No workouts</div>' : ''}
              ${dayWorkouts.map(workout => {
                const label = WORKOUT_OPTIONS[workout.workout_type] || workout.workout_type;
                return `
                  <div class="display-workout ${workout.workout_type}">
                    <div class="display-workout-name">${label}</div>
                    ${workout.notes ? `<div class="display-workout-notes">${workout.notes}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
