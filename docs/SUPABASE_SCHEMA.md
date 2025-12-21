# Supabase Database Schema

**Note:** This schema is for **workout planning**, not execution tracking.

## Tables

### 1. `workout_plans`
Stores weekly workout plan templates.

```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL, -- e.g., 'Standard 5-Day', 'Modified Week'
  is_active BOOLEAN DEFAULT false, -- Only one plan can be active at a time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user's plans
CREATE INDEX idx_workout_plans_user ON workout_plans(user_id);
```

### 2. `planned_workouts`
Stores individual planned workouts within a plan (day of week + exercises).

```sql
CREATE TABLE planned_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sun, 1=Mon, etc.
  workout_type TEXT NOT NULL, -- 'c_and_p', 'snatch', 'tgu', 'clubs', 'legs', 'rest'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying workouts by plan
CREATE INDEX idx_planned_workouts_plan ON planned_workouts(plan_id, day_of_week);
```

### 3. `body_fat_entries`
Tracks body fat percentage over time.

```sql
CREATE TABLE body_fat_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  body_fat_percent NUMERIC(4,2) NOT NULL, -- e.g., 33.50, 28.00
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, measurement_date)
);

-- Index for querying by user and date
CREATE INDEX idx_body_fat_user_date ON body_fat_entries(user_id, measurement_date DESC);
```

---

## Row Level Security (RLS) Policies

Enable RLS on all tables and create policies so users can only access their own data.

```sql
-- Enable RLS on all tables
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_fat_entries ENABLE ROW LEVEL SECURITY;

-- Policies for workout_plans
CREATE POLICY "Users can view own plans" ON workout_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON workout_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON workout_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON workout_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for planned_workouts
CREATE POLICY "Users can view own planned workouts" ON planned_workouts
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM workout_plans WHERE id = planned_workouts.plan_id)
  );

CREATE POLICY "Users can insert own planned workouts" ON planned_workouts
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM workout_plans WHERE id = planned_workouts.plan_id)
  );

CREATE POLICY "Users can update own planned workouts" ON planned_workouts
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM workout_plans WHERE id = planned_workouts.plan_id)
  );

CREATE POLICY "Users can delete own planned workouts" ON planned_workouts
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM workout_plans WHERE id = planned_workouts.plan_id)
  );

-- Policies for body_fat_entries
CREATE POLICY "Users can view own body fat entries" ON body_fat_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body fat entries" ON body_fat_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body fat entries" ON body_fat_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own body fat entries" ON body_fat_entries
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Setup Instructions

1. Go to Supabase dashboard → SQL Editor
2. Copy and paste the table creation SQL above
3. Run it to create all tables
4. Copy and paste the RLS policies
5. Run to enable security

---

## Example Queries

### Create a new weekly plan
```typescript
// Create plan
const { data: plan } = await supabase
  .from('workout_plans')
  .insert({
    plan_name: 'Standard 5-Day Week',
    is_active: true
  })
  .select()
  .single();

// Add planned workouts
await supabase.from('planned_workouts').insert([
  { plan_id: plan.id, day_of_week: 1, workout_type: 'c_and_p', notes: 'Heavy C&P + Squats' },
  { plan_id: plan.id, day_of_week: 2, workout_type: 'snatch', notes: 'Snatch EMOM' },
  { plan_id: plan.id, day_of_week: 3, workout_type: 'tgu', notes: 'TGU + Unilateral legs' },
  { plan_id: plan.id, day_of_week: 4, workout_type: 'c_and_p', notes: 'Volume C&P' },
  { plan_id: plan.id, day_of_week: 5, workout_type: 'clubs', notes: 'Clubs + optional light work' },
  { plan_id: plan.id, day_of_week: 6, workout_type: 'rest', notes: 'Rest day' },
  { plan_id: plan.id, day_of_week: 0, workout_type: 'rest', notes: 'Rest day' }
]);
```

### Get active plan with all workouts
```typescript
const { data } = await supabase
  .from('workout_plans')
  .select(`
    *,
    planned_workouts (*)
  `)
  .eq('is_active', true)
  .single();
```

### Track body fat progress
```typescript
// Add new entry
await supabase.from('body_fat_entries').insert({
  measurement_date: '2025-01-15',
  body_fat_percent: 32.5
});

// Get all entries for chart
const { data } = await supabase
  .from('body_fat_entries')
  .select('measurement_date, body_fat_percent')
  .order('measurement_date', { ascending: true });
```
