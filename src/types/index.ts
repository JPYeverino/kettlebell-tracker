// Database types matching Supabase schema

export type WorkoutType = 'c_and_p' | 'snatch' | 'tgu' | 'clubs' | 'legs' | 'abs' | 'rest';

export interface WorkoutPlan {
  id: string;
  user_id: string;
  plan_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannedWorkout {
  id: string;
  plan_id: string;
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  workout_type: WorkoutType;
  notes: string | null;
  created_at: string;
}

export interface BodyFatEntry {
  id: string;
  user_id: string;
  measurement_date: string; // ISO date string
  body_fat_percent: number;
  notes: string | null;
  created_at: string;
}

// Extended type for plan with workouts
export interface WorkoutPlanWithWorkouts extends WorkoutPlan {
  planned_workouts: PlannedWorkout[];
}

// Form data types (for creating/updating)
export interface CreateWorkoutPlan {
  plan_name: string;
  is_active?: boolean;
}

export interface CreatePlannedWorkout {
  plan_id: string;
  day_of_week: number;
  workout_type: WorkoutType;
  notes?: string;
}

export interface CreateBodyFatEntry {
  measurement_date: string;
  body_fat_percent: number;
  notes?: string;
}

// Program reference types (static content)
export interface Program {
  id: WorkoutType;
  name: string;
  role: string;
  frequency: string;
  description: string;
  details: string[];
}

export interface RPELevel {
  level: number;
  label: string;
  description: string;
}
