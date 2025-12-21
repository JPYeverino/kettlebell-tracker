# Kettlebell Tracker - TODO

## Project Overview
Static website for tracking kettlebell training program, nutrition, and progress toward body fat goals.

**Goal:** Drop from ~33% → ~28% body fat by end of March while maintaining/gaining lean mass.

**Deployment:**
- Frontend: GitHub Pages
- Backend: Supabase (PostgreSQL)
- Domain: `fitness.pabloyeverino.dev` (subdomain via CNAME)

---

## Completed ✓
- [x] Create GitHub repository (`JPYeverino/kettlebell-tracker`)
- [x] Initialize Vite + React + TypeScript project
- [x] Install core dependencies:
  - `@supabase/supabase-js` (backend client)
  - `recharts` (charts/visualization)
  - `date-fns` (date utilities)

---

## In Progress 🚧
- [ ] Complete React project setup
  - [ ] Install TailwindCSS for styling
  - [ ] Configure base layout and routing
  - [ ] Set up Supabase client configuration

---

## Next Steps 📋

### 1. Supabase Setup
- [ ] Create Supabase account/project at https://supabase.com
- [ ] Get credentials (Project URL, Anon Key)
- [ ] Create `.env.local` file with credentials
- [ ] Run SQL schema (see `docs/SUPABASE_SCHEMA.md`)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Optional: Enable authentication

### 2. Core Features to Build

#### Workout Logging
- [ ] C&P (Clean & Press) logger
  - Current ladder step tracker
  - Weight, sets, reps, RPE
  - Progression indicator (ready to move up?)
- [ ] Snatch EMOM logger
  - Duration (minutes)
  - Reps per minute
  - RPE
- [ ] TGU (Turkish Get-Up) logger
  - Level (1-5)
  - Full TGU sets/reps
- [ ] Leg work logger (squats, lunges)
- [ ] Clubs logger

#### Progress Tracking
- [ ] Body metrics form (weight, body fat %)
- [ ] Nutrition logger (calories, protein, carbs, fats)
- [ ] Calendar view of workouts
- [ ] Weekly summary cards

#### Visualization
- [ ] Weight progression charts (by exercise)
- [ ] Body fat % trend line
- [ ] RPE trends over time
- [ ] Volume tracking (weekly/monthly)
- [ ] Nutrition compliance charts

#### Program Reference
- [ ] 5-day weekly schedule display
- [ ] RPE cheat sheet (always visible)
- [ ] Current program parameters
- [ ] Progression rules reminder

### 3. UI/UX
- [ ] Mobile-first responsive design
- [ ] Quick-log buttons for common entries
- [ ] Offline-first with sync (optional)
- [ ] Dark mode toggle
- [ ] Print/export functionality

### 4. Deployment
- [ ] Configure `vite.config.ts` for GitHub Pages
- [ ] Create GitHub Actions workflow for auto-deploy
- [ ] Add `CNAME` file with `fitness.pabloyeverino.dev`
- [ ] Enable GitHub Pages in repo settings
- [ ] Configure DNS in Squarespace:
  - Type: CNAME
  - Host: `fitness`
  - Points to: `jpyeverino.github.io`

### 5. Optional Enhancements
- [ ] PWA support (install on phone)
- [ ] Push notifications for workout reminders
- [ ] Export data as CSV/PDF
- [ ] Share progress with coach
- [ ] Rest day/deload week tracking
- [ ] Injury/soreness notes

---

## Technical Decisions

### Styling
**Option A:** TailwindCSS (utility-first, fast)
**Option B:** CSS Modules + vanilla CSS
**Option C:** Styled Components

**Recommendation:** TailwindCSS for speed and mobile responsiveness

### Routing
**Option A:** React Router (if multi-page)
**Option B:** Single-page with tabs/sections

**Recommendation:** Start with tabs, add routing if needed

### State Management
**Option A:** React Context + hooks (simple)
**Option B:** Zustand (lightweight state manager)
**Option C:** TanStack Query (for server state)

**Recommendation:** Start with Context, add TanStack Query for Supabase caching

### Authentication
**Option A:** Supabase Auth (email/password)
**Option B:** Magic link
**Option C:** No auth (public data)

**Recommendation:** Supabase Auth for privacy

---

## Quick Start Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy (after GitHub Actions setup)
git push origin main
```

---

## Environment Variables Needed

Create `.env.local`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Reference
- Original program spec: See `docs/PROGRAM_SPEC.md`
- Database schema: See `docs/SUPABASE_SCHEMA.md`
- Design decisions: See `docs/DESIGN.md`
