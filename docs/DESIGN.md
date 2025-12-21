# Design Document - Kettlebell Tracker

## Architecture Overview

### Tech Stack
- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS (utility-first, mobile-responsive)
- **Charts:** Recharts (React charting library)
- **Backend:** Supabase (PostgreSQL + REST API + Realtime)
- **Authentication:** Supabase Auth
- **Hosting:** GitHub Pages
- **Domain:** `fitness.pabloyeverino.dev`

---

## Core Features

### 1. Workout Logging
**User Story:** As a user, I want to quickly log my workouts so I can track progress.

**Components:**
- `WorkoutForm` - Main form for logging workouts
- `CPForm` - Clean & Press specific form (ladder step selector, weight, RPE)
- `SnatchForm` - Snatch EMOM form (duration, reps/min, RPE)
- `TGUForm` - TGU form (level, full TGUs, RPE)
- `LegsForm` - Leg work form (exercise, weight, sets, reps, RPE)
- `ClubsForm` - Clubs form (duration, skill focus)

**Data Flow:**
1. User selects workout type (C&P, Snatch, TGU, etc.)
2. Form renders appropriate exercise inputs
3. On submit, create `workout` record + related `exercises` records
4. Show success message + option to log another

### 2. Progress Dashboard
**User Story:** As a user, I want to see my progress at a glance.

**Components:**
- `Dashboard` - Main view with cards/widgets
- `BodyFatChart` - Line chart showing body fat % trend
- `WeightProgressChart` - Bar/line chart showing weight progression by exercise
- `RPETrendChart` - Line chart showing RPE over time (fatigue indicator)
- `WeeklyVolume` - Bar chart of total volume by week
- `CurrentStats` - Cards showing current weight, body fat %, goal progress

**Metrics:**
- Current body fat % vs goal (28%)
- Days until March 31
- Total workouts this month
- Average RPE this week
- Nutrition compliance (days hitting protein/calorie targets)

### 3. Calendar View
**User Story:** As a user, I want to see my workout schedule and what I've completed.

**Components:**
- `WorkoutCalendar` - Monthly calendar grid
- `DayCell` - Individual day showing workout type + quick stats
- `DayDetail` - Modal/panel showing full workout details

**Visual Indicators:**
- Color-coded by workout type:
  - 🔴 Red: Heavy C&P + Squats (Strength)
  - 🟠 Orange: Snatch EMOM (Conditioning)
  - 🟡 Yellow: TGU + Unilateral (Skill)
  - 🟢 Green: Clubs (Accessory)
  - ⚪ Gray: Rest day
- Checkmark for completed workouts
- Warning icon for missed workouts

### 4. Nutrition Tracking
**User Story:** As a user, I want to log my daily nutrition to stay in deficit.

**Components:**
- `NutritionForm` - Daily macro entry (calories, protein, carbs, fat)
- `NutritionChart` - Weekly bar chart showing calories/protein
- `ComplianceIndicator` - Visual showing days hitting targets

**Targets:**
- Calories: 2,050–2,200 kcal/day
- Protein: 210–240 g/day
- Visual feedback: green (on target), yellow (close), red (off target)

### 5. Program Reference
**User Story:** As a user, I want quick access to my program details.

**Components:**
- `RPECheatSheet` - Always-visible sidebar or modal
- `WeeklySchedule` - 5-day schedule overview
- `ProgressionRules` - Reminder of when to increase weight
- `CurrentProgram` - Display of current ladder step, weights, etc.

---

## UI/UX Design

### Navigation
**Mobile-first tabs (bottom navigation):**
1. 📊 Dashboard (home/stats)
2. ➕ Log (workout/nutrition entry)
3. 📅 Calendar (workout history)
4. 📈 Progress (detailed charts)
5. ℹ️ Program (reference info)

**Desktop:** Side navigation or top tabs

### Color Scheme
- **Primary:** Blue/Teal (trust, stability)
- **Success:** Green (hitting targets)
- **Warning:** Yellow/Orange (close to targets)
- **Danger:** Red (missed targets, high RPE)
- **Neutral:** Gray (rest days, inactive)

### Typography
- **Headers:** Bold, sans-serif
- **Body:** Regular, readable (16px base)
- **Numbers/Stats:** Monospace or bold for emphasis

---

## Data Models (TypeScript)

```typescript
interface Workout {
  id: string;
  user_id: string;
  workout_date: string; // ISO date
  workout_type: 'c_and_p' | 'snatch' | 'tgu' | 'clubs' | 'legs';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Exercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  weight_kg?: number;
  sets?: number;
  reps?: number;
  reps_per_minute?: number;
  duration_minutes?: number;
  rpe?: number; // 1-10
  ladder_step?: string; // e.g., '3x(3-2-1)'
  notes?: string;
  created_at: string;
}

interface BodyMetric {
  id: string;
  user_id: string;
  measurement_date: string;
  weight_kg?: number;
  body_fat_percent?: number;
  notes?: string;
  created_at: string;
}

interface NutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  meals_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ProgramConfig {
  id: string;
  user_id: string;
  program_type: 'c_and_p' | 'snatch' | 'tgu' | 'clubs';
  current_weight_kg?: number;
  current_ladder_step?: string;
  target_reps_per_minute?: number;
  updated_at: string;
}
```

---

## State Management

### Approach
**React Context + Hooks** for global state:
- `AuthContext` - User authentication state
- `WorkoutContext` - Recent workouts, current program config
- `StatsContext` - Aggregated stats (for dashboard)

**TanStack Query (optional)** for server state:
- Caching Supabase queries
- Optimistic updates
- Background refetching

### Local State
- Forms: `useState` for form fields
- UI toggles: `useState` for modals, dropdowns

---

## Performance Considerations

### Optimization
- **Code splitting:** Lazy load charts/calendar (React.lazy)
- **Image optimization:** None needed (no images)
- **Data pagination:** Load last 30 days by default, infinite scroll for older
- **Memoization:** `useMemo` for expensive calculations, `React.memo` for chart components

### Offline Support (Phase 2)
- Service worker for offline functionality
- IndexedDB for local caching
- Sync when online

---

## Security

### Authentication
- Supabase Auth with email/password
- Optional: Magic link (passwordless)
- JWT stored in localStorage (managed by Supabase client)

### Authorization
- Row Level Security (RLS) policies in Supabase
- Users can only access their own data
- API keys exposed in frontend (anon key only, RLS protects data)

### Data Privacy
- No PII beyond email (for auth)
- Option to export/delete all data (GDPR-friendly)

---

## Deployment Strategy

### GitHub Actions Workflow
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Environment Variables
Stored in GitHub Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### DNS Configuration (Squarespace)
1. Go to Squarespace DNS settings
2. Add CNAME record:
   - **Type:** CNAME
   - **Host:** `fitness`
   - **Points to:** `jpyeverino.github.io.`
   - **TTL:** 3600 (1 hour)
3. Wait for DNS propagation (~5-60 minutes)
4. Access site at `https://fitness.pabloyeverino.dev`

---

## Future Enhancements

### Phase 2 (Post-MVP)
- 📱 PWA support (installable on phone)
- 🔔 Push notifications (workout reminders)
- 📤 Export data (CSV, PDF)
- 👥 Share with coach/friend
- 📸 Progress photos
- 🎯 Custom goals/milestones
- 🔁 Auto-calculate next workout weights

### Phase 3 (Advanced)
- 📊 Advanced analytics (velocity, volume load)
- 🤖 AI suggestions (deload weeks, progression)
- 🏆 Achievements/badges
- 📝 Workout templates
- ⏱️ Rest timer with EMOM beep

---

## Open Questions

1. **Styling:** TailwindCSS or plain CSS?
2. **Authentication:** Required on first load or allow anonymous trial?
3. **Charts:** Recharts or Chart.js?
4. **Routing:** Multi-page (React Router) or single-page tabs?
5. **Dark mode:** User toggle or system preference?

**Recommendations:**
1. TailwindCSS (faster development)
2. Require auth (data privacy)
3. Recharts (better React integration)
4. Single-page tabs initially (simpler)
5. System preference with manual toggle
