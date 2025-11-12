# Quick Start Guide - Fix Empty Practice Page

Your practice page is empty because the database hasn't been seeded yet. Follow these steps:

## Step 1: Seed Legacy Practice Projects

The practice page uses the legacy `practiceProjects` table. You need to seed it first.

### Option A: Using Convex Dashboard (Easiest)

1. Open your Convex dashboard
2. Go to **Functions** tab
3. Find `practiceProjects:seedProjects`
4. Click to run it
5. For the `projects` argument, paste the contents of `data/projects-seed.json`
6. Click **Run**

### Option B: Using Convex CLI

```bash
# From your project root
npx convex run practiceProjects:seedProjects \
  --arg projects="$(cat data/projects-seed.json)"
```

### Verify Seeding

1. Go to Convex Dashboard → **Data** tab
2. Click on `practiceProjects` table
3. You should see 12 projects (3 per level + 1 assessment per level)

## Step 2: Verify Practice Page

1. Refresh `http://localhost:3000/practice`
2. You should now see:
   - Level 1 with 4 projects (3 challenges + 1 assessment)
   - Level 2 with 4 projects (locked until Level 1 complete)
   - Level 3 with 4 projects (locked until Level 2 complete)

## Step 3: (Optional) Run Phase 1 Migrations

If you want to enable the new Phase 1 features (placement test, daily drills):

1. Go to Convex Dashboard → **Functions**
2. Find `migrations:runAllMigrations` (internal mutation)
3. Click **Run**
4. This will:
   - Create 4 practice tracks
   - Create item templates
   - Migrate legacy projects to new schema

## Troubleshooting

### Practice page still empty after seeding

**Check 1: Verify data exists**
```bash
# In Convex dashboard, run this query:
practiceProjects:list
```

**Check 2: Check authentication**
- Make sure you're logged in
- The page redirects to `/auth` if not authenticated

**Check 3: Check browser console**
- Open DevTools (F12)
- Look for any errors in Console tab
- Check Network tab for failed API calls

### "No projects found" error

This means the `practiceProjects:list` query is returning empty. Possible causes:

1. **Seeding failed** - Check Convex logs for errors
2. **Wrong environment** - Make sure you're connected to the right Convex deployment
3. **Schema not deployed** - Run `npx convex deploy` first

### Projects show but are all locked

This is normal! The progression system works like this:

1. **Level 1** - All projects unlocked by default
2. **Level 2** - Unlocks after completing Level 1 assessment
3. **Level 3** - Unlocks after completing Level 2 assessment

To unlock everything for testing:
1. Complete a Level 1 project
2. Or manually update `userStats` in Convex dashboard

## Quick Test Flow

1. **Seed projects** (Step 1 above)
2. **Visit practice page** - Should show Level 1 projects
3. **Click "Start Challenge"** on any Level 1 project
4. **Complete the project** - Answer questions
5. **Check progress** - Stats should update
6. **Level 2 unlocks** - After completing Level 1 assessment

## What You Should See

After seeding, your practice page should display:

```
Practice Zone
Progress through levels, master prompting skills, and unlock new challenges.

[Stats Cards]
Prompt Score: 0
Challenges Complete: 0
Badges Earned: 0
Weekly Minutes: 0

Level 1 - Beginner
[Progress Bar: 0/4]

├─ Social Media Content Creator (Unlocked)
├─ Study Guide Builder (Unlocked)
├─ Presentation Designer (Unlocked)
└─ Level 1 Assessment (Unlocked after completing above)

Level 2 - Intermediate (Locked)
[Progress Bar: 0/4]

├─ Interactive Quiz Master (Locked)
├─ Business Analyst (Locked)
├─ Website Builder (Locked)
└─ Level 2 Assessment (Locked)

Level 3 - Advanced (Locked)
[Progress Bar: 0/4]

├─ Financial Advisor (Locked)
├─ Customer Success Specialist (Locked)
├─ Strategic Planner (Locked)
└─ Level 3 Assessment (Locked)
```

## Next Steps

Once the practice page is working:

1. **Test a project** - Complete one to verify the flow
2. **Enable Phase 1 features** - Run migrations for placement test & daily drills
3. **Add new components** - Integrate PlacementTest and DailyDrill components
4. **Monitor usage** - Check Convex logs and analytics

## Need Help?

- Check `docs/PHASE_1_IMPLEMENTATION.md` for detailed setup
- Review `PHASE_1_DEPLOYMENT_CHECKLIST.md` for full deployment guide
- Check Convex logs for errors: `npx convex logs`

---

**TL;DR:** Run `practiceProjects:seedProjects` in Convex dashboard with data from `data/projects-seed.json`
