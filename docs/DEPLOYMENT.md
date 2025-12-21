# Deployment Guide - GitHub Pages + Supabase

## Prerequisites

1. ✅ GitHub repository created: `JPYeverino/kettlebell-tracker`
2. ✅ Vite + React + TypeScript project initialized
3. ⏳ Supabase project (to be created)
4. ⏳ Domain configured: `fitness.pabloyeverino.dev`

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** `kettlebell-tracker`
   - **Database Password:** (generate strong password, save it)
   - **Region:** Choose closest to you (e.g., `us-west-1`)
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

### 1.2 Get API Credentials
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 1.3 Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy contents from `/docs/SUPABASE_SCHEMA.md`
4. Paste and click **"Run"**
5. Verify tables created: Go to **Table Editor** → should see `workouts`, `exercises`, etc.

### 1.4 Enable Authentication (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. For local dev, disable email confirmation:
   - **Settings** → **Auth** → **Email Auth** → Toggle **"Enable email confirmations"** OFF

---

## Step 2: Local Development Setup

### 2.1 Environment Variables
Create `.env.local` in project root:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

**Important:** This file is already in `.gitignore` - never commit it!

### 2.2 Install Dependencies (if not done)
```bash
npm install
```

### 2.3 Run Development Server
```bash
npm run dev
```

Open `http://localhost:5173` in browser.

---

## Step 3: Configure GitHub Pages

### 3.1 Update `vite.config.ts`
Add `base` property for GitHub Pages:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/kettlebell-tracker/', // Add this line
})
```

**Note:** If using custom domain, you can use `base: '/'` instead.

### 3.2 Add CNAME File
Create `public/CNAME` with your subdomain:

```
fitness.pabloyeverino.dev
```

This tells GitHub Pages to use your custom domain.

### 3.3 Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch: # Allow manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3.4 Add Secrets to GitHub
1. Go to repository on GitHub: `https://github.com/JPYeverino/kettlebell-tracker`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each:
   - Name: `VITE_SUPABASE_URL`
   - Value: (paste your Supabase URL)
   - Click **"Add secret"**

   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: (paste your anon key)
   - Click **"Add secret"**

### 3.5 Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Under **Source**, select: **GitHub Actions**
3. Save

---

## Step 4: DNS Configuration (Squarespace)

### 4.1 Add CNAME Record
1. Log in to Squarespace
2. Go to **Settings** → **Domains** → **DNS Settings** for `pabloyeverino.dev`
3. Click **"Add Record"**
4. Select **CNAME** record type
5. Fill in:
   - **Host:** `fitness`
   - **Points to:** `jpyeverino.github.io.`
   - **TTL:** `3600` (1 hour)
6. Click **"Save"**

### 4.2 Wait for DNS Propagation
- Usually takes 5-60 minutes
- Check status: `dig fitness.pabloyeverino.dev` (should show CNAME)
- Or use online tool: [whatsmydns.net](https://www.whatsmydns.net)

---

## Step 5: Deploy

### 5.1 Push to GitHub
```bash
git add .
git commit -m "Initial setup with Supabase and deployment config"
git push origin main
```

### 5.2 Monitor Deployment
1. Go to **Actions** tab on GitHub
2. Watch workflow run (should take ~2-3 minutes)
3. Green checkmark = success!

### 5.3 Access Your Site
After DNS propagates:
- **Custom domain:** `https://fitness.pabloyeverino.dev`
- **GitHub domain:** `https://jpyeverino.github.io/kettlebell-tracker/`

---

## Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Ensure secrets are set correctly
- Verify `npm run build` works locally

### 404 on Routes (if using React Router)
Add `public/_redirects` file:
```
/*    /index.html   200
```

Or configure `404.html` to redirect to `index.html`.

### Custom Domain Not Working
1. Verify CNAME record: `dig fitness.pabloyeverino.dev`
2. Check GitHub Pages settings: Custom domain should show `fitness.pabloyeverino.dev`
3. Wait longer (DNS can take up to 48 hours, but usually ~1 hour)
4. Try accessing via `https://` (not `http://`)

### Supabase Connection Issues
- Check browser console for errors
- Verify `.env.local` has correct URL/key
- Ensure GitHub secrets match Supabase credentials
- Check Supabase project is active (not paused)

---

## Maintenance

### Updating the Site
1. Make changes locally
2. Test: `npm run dev`
3. Build: `npm run build` (verify no errors)
4. Commit and push: GitHub Actions will auto-deploy

### Monitoring
- GitHub Actions: See deployment history
- Supabase Dashboard: Monitor database usage, API calls
- Browser DevTools: Check console for errors

### Backup
- Database: Supabase has automatic backups (free tier: 7 days)
- Code: Git history on GitHub
- Manual export: Use Supabase SQL Editor to export data

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| GitHub Pages | Free | $0 |
| Supabase | Free tier | $0 |
| Domain | Existing | $0 (already owned) |
| **Total** | | **$0/month** |

**Limits (Free tier):**
- GitHub Pages: 1GB storage, 100GB bandwidth/month
- Supabase: 500MB database, 50K monthly active users, 2GB bandwidth

You're well within limits for personal use!

---

## Next Steps After Deployment

1. ✅ Verify site loads at `fitness.pabloyeverino.dev`
2. 🔐 Create your user account (first user)
3. 📝 Log your first workout
4. 📊 Check dashboard populates correctly
5. 🎨 Tweak styling/UX as needed
6. 📱 Test on mobile device
