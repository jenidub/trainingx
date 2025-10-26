# Quick Start: Migrate Projects to Convex

## TL;DR - 3 Commands

```bash
# 1. Install tsx (if needed)
npm install -D tsx

# 2. Make sure Convex is running
npm run dev:backend

# 3. Seed the database
npm run seed:projects
```

Then switch `src/App.tsx` to use `PracticeZoneConvex` instead of `PracticeZone`.

---

## What Was Done

### Files Created:
1. **`convex/practiceProjects.ts`** - Convex functions for practice projects
   - `list()` - Get all projects
   - `getBySlug()` - Get project by slug
   - `seedProjects()` - Seed from JSON
   - `updateProject()` - Update a project
   - `clearAll()` - Clear all projects

2. **`scripts/seed-projects.ts`** - Script to populate Convex from JSON

3. **Documentation**:
   - `PROJECTS_CONVEX_MIGRATION.md` - Overview and benefits
   - `MIGRATION_STEPS.md` - Detailed step-by-step guide
   - `QUICK_START_CONVEX.md` - This file

### Files Modified:
1. **`convex/schema.ts`** - Added `practiceProjects` table
2. **`package.json`** - Added `seed:projects` script

### Ready to Switch:
- **`src/App.tsx`** - Currently uses local `PracticeZone`
  - Switch to `PracticeZoneConvex` when ready

---

## Current State

✅ **Local Version (Active)**
- Using: `src/pages/PracticeZone.tsx`
- Data: `src/data/projects-seed.json`
- Storage: Browser localStorage

⏳ **Convex Version (Ready)**
- Using: `src/pages/PracticeZoneConvex.tsx`
- Data: Convex database (after seeding)
- Storage: Convex cloud

---

## Migration Process

### Option A: Quick Migration (Recommended)

```bash
# 1. Seed Convex
npm run seed:projects

# 2. Switch in App.tsx
# Change: import PracticeZone from "@/pages/PracticeZone";
# To:     import PracticeZone from "@/pages/PracticeZoneConvex";

# 3. Test
npm run dev
```

### Option B: Gradual Migration

Keep both versions and test Convex separately:

1. Seed Convex: `npm run seed:projects`
2. Create a test route in `App.tsx`:
   ```typescript
   <Route path="/practice-test">
     <PracticeZoneConvex />
   </Route>
   ```
3. Test at `/practice-test`
4. When satisfied, switch main route

---

## Verification Checklist

After seeding:
- [ ] Open Convex dashboard: `npx convex dashboard`
- [ ] Check "practiceProjects" table has data
- [ ] Verify all 20+ projects are present
- [ ] Check project structure matches JSON

After switching:
- [ ] Navigate to `/practice`
- [ ] All projects display correctly
- [ ] Levels and categories work
- [ ] Project details load
- [ ] Completion flow works
- [ ] No console errors

---

## Rollback

If anything goes wrong:

```typescript
// In src/App.tsx
import PracticeZone from "@/pages/PracticeZone";
// import PracticeZone from "@/pages/PracticeZoneConvex";
```

Your local JSON data is untouched, so you can always revert.

---

## Benefits of Convex

- ✅ Real-time sync across devices
- ✅ No data loss on cache clear
- ✅ Easy to update projects
- ✅ Better performance
- ✅ Analytics ready
- ✅ Admin panel ready

---

## Need Help?

1. **Detailed guide**: See `MIGRATION_STEPS.md`
2. **Overview**: See `PROJECTS_CONVEX_MIGRATION.md`
3. **Convex logs**: `npx convex logs`
4. **Dashboard**: `npx convex dashboard`
