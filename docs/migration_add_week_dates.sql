-- Migration: Add week-based planning
-- Run this in Supabase SQL Editor

-- Add week_start_date column to planned_workouts
ALTER TABLE planned_workouts
ADD COLUMN week_start_date DATE;

-- Update existing workouts to current week (Monday-based)
UPDATE planned_workouts
SET week_start_date = DATE_TRUNC('week', CURRENT_DATE)::DATE
WHERE week_start_date IS NULL;

-- Make week_start_date required for future inserts
ALTER TABLE planned_workouts
ALTER COLUMN week_start_date SET NOT NULL;

-- Update index to include week_start_date
DROP INDEX IF EXISTS idx_planned_workouts_plan;
CREATE INDEX idx_planned_workouts_week ON planned_workouts(plan_id, week_start_date, day_of_week);

-- Add comment
COMMENT ON COLUMN planned_workouts.week_start_date IS 'Monday of the week this workout is planned for (YYYY-MM-DD)';
