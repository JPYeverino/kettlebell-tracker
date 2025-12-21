# 🏋️ Kettlebell Tracker

A static web app for tracking kettlebell training programs, nutrition, and body composition progress.

**Goal:** Drop from ~33% → ~28% body fat by end of March while maintaining/gaining lean mass through structured kettlebell training.

**Live Site:** [fitness.pabloyeverino.dev](https://fitness.pabloyeverino.dev) *(coming soon)*

---

## Features

- 📝 **Workout Logging** - Track C&P, Snatch, TGU, Clubs, and leg work
- 📊 **Progress Dashboard** - Visualize body fat %, strength gains, and volume
- 📅 **Calendar View** - See your training schedule and history
- 🍽️ **Nutrition Tracking** - Log daily calories, protein, and macros
- 📈 **Charts & Analytics** - Track trends over time
- 📱 **Mobile-Responsive** - Log workouts at the gym from your phone

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS *(to be added)*
- **Charts:** Recharts
- **Backend:** Supabase (PostgreSQL)
- **Hosting:** GitHub Pages
- **Domain:** `fitness.pabloyeverino.dev`

---

## Documentation

📁 **See `/docs` folder for detailed documentation:**

- **[TODO.md](./TODO.md)** - Project tasks and progress tracker
- **[docs/PROGRAM_SPEC.md](./docs/PROGRAM_SPEC.md)** - Complete training program details
- **[docs/SUPABASE_SCHEMA.md](./docs/SUPABASE_SCHEMA.md)** - Database schema and SQL setup
- **[docs/DESIGN.md](./docs/DESIGN.md)** - Architecture, components, and UI/UX decisions
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Step-by-step deployment guide

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/JPYeverino/kettlebell-tracker.git
cd kettlebell-tracker

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Deployment

This app automatically deploys to GitHub Pages via GitHub Actions when you push to `main`.

**See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full deployment instructions.**

---

## Project Structure

```
kettlebell-tracker/
├── docs/               # Documentation
│   ├── DESIGN.md
│   ├── DEPLOYMENT.md
│   ├── PROGRAM_SPEC.md
│   └── SUPABASE_SCHEMA.md
├── public/             # Static assets
│   └── CNAME          # Custom domain config
├── src/
│   ├── components/    # React components
│   ├── lib/           # Utilities, Supabase client
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── .env.local         # Environment variables (not committed)
├── TODO.md            # Task tracker
└── README.md
```

---

## Environment Variables

Create a `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Never commit `.env.local` to git!**

---

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!

---

## License

MIT

---

## Acknowledgments

- Training program design: Based on kettlebell strength and conditioning principles
- Built with [Vite](https://vitejs.dev/), [React](https://react.dev/), and [Supabase](https://supabase.com)
