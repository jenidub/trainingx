# Practice Page Setup - Why It's Empty

## The Problem

Your practice page at `http://localhost:3000/practice` shows only the header because the `practiceProjects` table in Convex is empty.

## The Solution

You need to seed the database with practice projects. Here's how:

### Quick Fix (2 minutes)

1. **Open Convex Dashboard**
   ```bash
   # Your dashboard URL is in .env.local as NEXT_PUBLIC_CONVEX_URL
   # Or run: npx convex dashboard
   ```

2. **Go to Functions tab**

3. **Run `practiceProjects:seedProjects`**
   - Click on the function
   - For the `projects` argument, copy-paste the entire contents of `data/projects-seed.json`
   - Click "Run"

4. **Refresh your practice page**
   - You should now see 12 projects across 3 levels

### Alternative: Use CLI

```bash
# Make sure you're in the project root
npx convex run practiceProjects:seedProjects \
  --arg projects="$(cat data/projects-seed.json)"
```

## Verify It Worked

Run this debug query in Convex dashboard:

```bash
npx convex run debug:checkPracticeProjects
```

You should see:
```json
{
  "total": 12,
  "byLevel": {
    "level1": 4,
    "level2": 4,
    "level3": 4
  },
  "assessments": 3
}
```

## What You'll See After Seeding

The practice page will display:

### Level 1 (Beginner) - 4 Projects
1. Social Media Content Creator
2. Study Guide Builder  
3. Presentation Designer
4. Level 1 Assessment

### Level 2 (Intermediate) - 4 Projects
1. Interactive Quiz Master
2. Business Analyst
3. Website Builder
4. Level 2 Assessment

### Level 3 (Advanced) - 4 Projects
1. Financial Advisor
2. Customer Success Specialist
3. Strategic Planner
4. Level 3 Assessment

## Understanding the Data Flow

```
data/projects-seed.json
    ↓ (seed via practiceProjects:seedProjects)
practiceProjects table (Convex)
    ↓ (query via api.practiceProjects.list)
app/(routes)/practice/page.tsx
    ↓ (renders)
Practice Zone UI
```

## Phase 1 Features (Optional)

After seeding legacy projects, you can enable Phase 1 features:

1. **Run migrations**
   ```bash
   # In Convex dashboard, run:
   migrations:runAllMigrations
   ```

2. **This creates:**
   - Practice tracks (Content, Analytics, Ops, Strategy)
   - Item templates for new content types
   - Placement test infrastructure
   - Daily drills system

3. **Add components to your app:**
   ```tsx
   import { PlacementTest } from "@/components/PlacementTest";
   import { DailyDrill } from "@/components/DailyDrill";
   
   // In your dashboard or practice page
   <PlacementTest userId={user._id} />
   <DailyDrill userId={user._id} />
   ```

## Troubleshooting

### Still seeing empty page?

**Check 1: Are you logged in?**
- The page redirects to `/auth` if not authenticated
- Create an account or log in first

**Check 2: Check browser console**
- Press F12 to open DevTools
- Look for errors in Console tab
- Check Network tab for failed API calls

**Check 3: Verify data in Convex**
```bash
# Run debug query
npx convex run debug:checkPracticeProjects

# Or check in dashboard:
# Data tab → practiceProjects table
```

**Check 4: Check Convex connection**
```bash
# Make sure Convex is running
npx convex dev

# Check your .env.local has:
NEXT_PUBLIC_CONVEX_URL=https://...
```

### Projects show but are all locked?

This is normal! The progression system:
- **Level 1**: All unlocked
- **Level 2**: Unlocks after Level 1 assessment
- **Level 3**: Unlocks after Level 2 assessment

To test, complete a Level 1 project first.

## Files Reference

- `data/projects-seed.json` - Source data (12 projects)
- `convex/practiceProjects.ts` - Seeding function
- `app/(routes)/practice/page.tsx` - Practice page UI
- `convex/debug.ts` - Debug utilities

## Next Steps

1. ✅ Seed practice projects (you're here)
2. Test completing a project
3. Enable Phase 1 features (optional)
4. Add PlacementTest and DailyDrill components
5. Monitor usage and engagement

## Quick Commands

```bash
# Seed projects
npx convex run practiceProjects:seedProjects --arg projects=@data/projects-seed.json

# Check status
npx convex run debug:checkPracticeProjects
npx convex run debug:checkPhase1Status

# Run Phase 1 migrations
npx convex run migrations:runAllMigrations

# View logs
npx convex logs
```

---

**Need more help?** Check `QUICK_START.md` or `docs/PHASE_1_IMPLEMENTATION.md`
