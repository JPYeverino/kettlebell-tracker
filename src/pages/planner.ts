import { supabase } from '../lib/supabase';
import type { WorkoutType, WorkoutPlanWithWorkouts, PlannedWorkout } from '../types';
import { formatWeekStart, formatWeekRange, addWeeks, isCurrentWeek } from '../lib/weekUtils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WORKOUT_OPTIONS: { value: WorkoutType; label: string }[] = [
  { value: 'c_and_p', label: 'Clean & Press' },
  { value: 'snatch', label: 'Snatch EMOM' },
  { value: 'tgu', label: 'Turkish Get-Up' },
  { value: 'clubs', label: 'Single-Arm Clubs' },
  { value: 'legs', label: 'Leg Work' },
  { value: 'abs', label: '5-Min Abs' },
  { value: 'rest', label: 'Rest' },
];

// Default template for new weeks
const DEFAULT_TEMPLATE = [
  { day_of_week: 1, workout_type: 'c_and_p' as WorkoutType, notes: 'Heavy C&P' },
  { day_of_week: 1, workout_type: 'legs' as WorkoutType, notes: 'Squats' },
  { day_of_week: 2, workout_type: 'snatch' as WorkoutType, notes: 'Snatch EMOM' },
  { day_of_week: 3, workout_type: 'tgu' as WorkoutType, notes: 'TGU' },
  { day_of_week: 3, workout_type: 'legs' as WorkoutType, notes: 'Unilateral legs' },
  { day_of_week: 4, workout_type: 'c_and_p' as WorkoutType, notes: 'Volume C&P' },
  { day_of_week: 5, workout_type: 'clubs' as WorkoutType, notes: 'Clubs' },
  { day_of_week: 6, workout_type: 'rest' as WorkoutType, notes: 'Rest day' },
  { day_of_week: 0, workout_type: 'rest' as WorkoutType, notes: 'Rest day' },
];

let plan: WorkoutPlanWithWorkouts | null = null;
let currentWeekStart = new Date();
let editing = false;

export function renderPlanner(container: HTMLElement) {
  currentWeekStart = new Date(); // Start at current week
  loadPlan().then(() => render(container));
}

async function loadPlan() {
  // Get or create plan
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!error && data) {
    plan = data as WorkoutPlanWithWorkouts;
  } else if (error?.code === 'PGRST116') {
    await createDefaultPlan();
    await loadPlan();
    return;
  }

  // Load workouts for current week
  if (plan) {
    await loadWeekWorkouts();
  }
}

async function loadWeekWorkouts() {
  if (!plan) return;

  const weekStart = formatWeekStart(currentWeekStart);
  const { data } = await supabase
    .from('planned_workouts')
    .select('*')
    .eq('plan_id', plan.id)
    .eq('week_start_date', weekStart);

  if (data && data.length > 0) {
    plan.planned_workouts = data;
  } else {
    // No workouts for this week, copy from template
    await copyTemplateToWeek(weekStart);
    await loadWeekWorkouts();
  }
}

async function createDefaultPlan() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: newPlan } = await supabase
    .from('workout_plans')
    .insert({
      user_id: user.id,
      plan_name: 'My Kettlebell Plan',
      is_active: true
    })
    .select()
    .single();

  if (!newPlan) return;
  plan = newPlan as WorkoutPlanWithWorkouts;

  // Create workouts for current week
  await copyTemplateToWeek(formatWeekStart(currentWeekStart));
}

async function copyTemplateToWeek(weekStart: string) {
  if (!plan) return;

  const workouts = DEFAULT_TEMPLATE.map(w => ({
    plan_id: plan.id,
    week_start_date: weekStart,
    day_of_week: w.day_of_week,
    workout_type: w.workout_type,
    notes: w.notes,
  }));

  await supabase.from('planned_workouts').insert(workouts);
}

function getWorkouts(dayOfWeek: number): PlannedWorkout[] {
  return plan?.planned_workouts?.filter(w => w.day_of_week === dayOfWeek) || [];
}

async function addWorkout(dayOfWeek: number) {
  if (!plan) return;
  const weekStart = formatWeekStart(currentWeekStart);

  await supabase.from('planned_workouts').insert({
    plan_id: plan.id,
    week_start_date: weekStart,
    day_of_week: dayOfWeek,
    workout_type: 'rest',
  });

  await loadWeekWorkouts();
}

async function updateWorkout(id: string, workoutType: WorkoutType) {
  await supabase.from('planned_workouts').update({ workout_type: workoutType }).eq('id', id);
  await loadWeekWorkouts();
}

async function updateNotes(id: string, notes: string) {
  await supabase.from('planned_workouts').update({ notes }).eq('id', id);
  await loadWeekWorkouts();
}

async function deleteWorkout(id: string) {
  await supabase.from('planned_workouts').delete().eq('id', id);
  await loadWeekWorkouts();
}

async function navigateWeek(direction: number) {
  currentWeekStart = addWeeks(currentWeekStart, direction);
  await loadWeekWorkouts();
}

async function goToCurrentWeek() {
  currentWeekStart = new Date();
  await loadWeekWorkouts();
}

function render(container: HTMLElement) {
  if (!plan) {
    container.innerHTML = '<div class="loading">Loading plan...</div>';
    return;
  }

  const weekRange = formatWeekRange(currentWeekStart);
  const isCurrent = isCurrentWeek(currentWeekStart);

  container.innerHTML = `
    <div class="weekly-planner">
      <div class="planner-header">
        <div>
          <h2>Weekly Planner</h2>
          <p class="subtitle">${plan.plan_name}</p>
        </div>
        <button id="edit-btn" class="btn-edit">${editing ? 'Done' : 'Edit'}</button>
      </div>

      <div class="week-navigation">
        <button id="prev-week" class="btn-week-nav">&larr; Previous</button>
        <div class="week-display">
          <div class="week-range">${weekRange}</div>
          ${!isCurrent ? '<button id="current-week" class="btn-current-week">This Week</button>' : '<div class="current-week-badge">Current Week</div>'}
        </div>
        <button id="next-week" class="btn-week-nav">Next &rarr;</button>
      </div>

      <div class="week-grid">
        ${DAYS.map((day, i) => {
          // Adjust for Monday-based week (0=Mon, 6=Sun)
          const dayOfWeek = i === 6 ? 0 : i + 1;
          const workouts = getWorkouts(dayOfWeek);
          const today = new Date().getDay();
          const isToday = isCurrent && dayOfWeek === today;

          return `
            <div class="day-card ${isToday ? 'day-today' : ''}">
              <div class="day-header">
                <strong>${day}</strong>
                ${editing ? `<button class="btn-add-workout" data-day="${dayOfWeek}">+</button>` : ''}
              </div>

              ${workouts.length === 0 ? '<div class="empty-day">No workouts</div>' : ''}

              ${workouts.map(workout => {
                const workoutLabel = WORKOUT_OPTIONS.find(w => w.value === workout.workout_type)?.label || 'Unknown';
                return `
                  <div class="workout-item">
                    ${editing ? `
                      <div class="workout-controls">
                        <select data-id="${workout.id}" class="workout-select-small">
                          ${WORKOUT_OPTIONS.map(opt => `
                            <option value="${opt.value}" ${workout.workout_type === opt.value ? 'selected' : ''}>
                              ${opt.label}
                            </option>
                          `).join('')}
                        </select>
                        <button class="btn-delete-small" data-id="${workout.id}">×</button>
                      </div>
                      <input type="text" data-id="${workout.id}" class="notes-input-small" value="${workout.notes || ''}" placeholder="Notes (e.g., 16kg, 3x5)..." />
                    ` : `
                      <div class="workout-label ${workout.workout_type}">${workoutLabel}</div>
                      ${workout.notes ? `<div class="notes">${workout.notes}</div>` : ''}
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  attachListeners(container);
}

function attachListeners(container: HTMLElement) {
  // Edit button
  const editBtn = document.getElementById('edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      editing = !editing;
      render(container);
    });
  }

  // Week navigation
  document.getElementById('prev-week')?.addEventListener('click', async () => {
    await navigateWeek(-1);
    render(container);
  });

  document.getElementById('next-week')?.addEventListener('click', async () => {
    await navigateWeek(1);
    render(container);
  });

  document.getElementById('current-week')?.addEventListener('click', async () => {
    await goToCurrentWeek();
    render(container);
  });

  if (editing) {
    // Add workout buttons
    container.querySelectorAll<HTMLButtonElement>('.btn-add-workout').forEach(btn => {
      btn.addEventListener('click', async () => {
        const day = parseInt(btn.dataset.day!);
        await addWorkout(day);
        render(container);
      });
    });

    // Workout type selects
    container.querySelectorAll<HTMLSelectElement>('.workout-select-small').forEach(select => {
      select.addEventListener('change', async () => {
        await updateWorkout(select.dataset.id!, select.value as WorkoutType);
        render(container);
      });
    });

    // Notes inputs
    container.querySelectorAll<HTMLInputElement>('.notes-input-small').forEach(input => {
      input.addEventListener('blur', async () => {
        await updateNotes(input.dataset.id!, input.value);
      });
    });

    // Delete buttons
    container.querySelectorAll<HTMLButtonElement>('.btn-delete-small').forEach(btn => {
      btn.addEventListener('click', async () => {
        await deleteWorkout(btn.dataset.id!);
        render(container);
      });
    });
  }
}
