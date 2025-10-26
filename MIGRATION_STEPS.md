# Step-by-Step Migration: Projects to Convex

## Prerequisites

- ✅ Convex is set up and running
- ✅ You have a `.env.local` file with `VITE_CONVEX_URL`
- ✅ `tsx` package is installed (for running TypeScript scripts)

## Step 1: Install tsx (if not already installed)

```bash
npm install -D tsx
```

## Step 2: Push Schema Changes to Convex

The schema has been updated with the new `practiceProjects` table. Push it to Convex:

```bash
# Make sure Convex dev is running
npm run dev:backend

# Or if you want to push without dev mode
npx convex dev
```

Wait for the schema to sync. You should see:
```
✓ Schema pushed successfully
```

## Step 3: Seed the Database

Run the seed script to populate Convex with all projects from `projects-seed.json`:

```bash
npm run seed:projects
```

Expected output:
```
🌱 Starting project seeding...
📡 Connecting to Convex: https://your-deployment.convex.cloud
📦 Found 20 projects in seed file
✅ Seeding complete!
   - Inserted: 20 new projects
   - Skipped: 0 existing projects
   - Total: 20 projects
```

## Step 4: Verify Data in Convex Dashboard

1. Open Convex dashboard: `npx convex dashboard`
2. Navigate to "Data" tab
3. Select "practiceProjects" table
4. Verify all projects are there with correct data

## Step 5: Switch to Convex in App

Update `src/App.tsx`:

```typescript
// Comment out local version
// import PracticeZone from "@/pages/PracticeZone";

// Uncomment Convex version
import PracticeZone from "@/pages/PracticeZoneConvex";
```

## Step 6: Test the Practice Zone

1. Start the dev server: `npm run dev`
2. Navigate to `/practice`
3. Verify:
   - ✅ All projects are displayed
   - ✅ Projects are organized by level
   - ✅ Filtering works
   - ✅ Project details load correctly
   - ✅ No console errors

## Step 7: Test Project Completion Flow

1. Start a project
2. Complete it
3. Verify the completion is saved to Convex
4. Check the Dashboard to see updated stats

## Troubleshooting

### Error: "CONVEX_URL not found"

**Solution**: Make sure you have `.env.local` with:
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### Error: "Table practiceProjects does not exist"

**Solution**: 
1. Make sure Convex dev is running
2. Schema should auto-sync
3. If not, try: `npx convex dev --once`

### Error: "Seeding failed"

**Solution**:
1. Check Convex is running: `npx convex dev`
2. Verify your Convex URL is correct
3. Check the console for specific error messages

### Projects not showing in UI

**Solution**:
1. Open browser console for errors
2. Verify data in Convex dashboard
3. Check that `PracticeZoneConvex` is imported in `App.tsx`
4. Clear browser cache and reload

## Rollback (if needed)

If you need to revert to local data:

1. In `src/App.tsx`:
   ```typescript
   import PracticeZone from "@/pages/PracticeZone";
   // import PracticeZone from "@/pages/PracticeZoneConvex";
   ```

2. Restart dev server

Your local JSON data is still intact, so no data is lost.

## Re-seeding (if needed)

If you need to update projects or re-seed:

1. **Clear existing data**:
   ```bash
   # In Convex dashboard, delete all records from practiceProjects table
   # Or use the clearAll mutation
   ```

2. **Update** `src/data/projects-seed.json` with new data

3. **Re-run seed**:
   ```bash
   npm run seed:projects
   ```

## Next Steps After Migration

1. ✅ Remove local JSON dependency (optional)
2. ✅ Create admin panel to manage projects
3. ✅ Add project analytics
4. ✅ Enable real-time updates
5. ✅ Add project search functionality

## Files Created/Modified

### Created:
- ✅ `convex/practiceProjects.ts` - Convex queries and mutations
- ✅ `scripts/seed-projects.ts` - Seed script
- ✅ `PROJECTS_CONVEX_MIGRATION.md` - Migration overview
- ✅ `MIGRATION_STEPS.md` - This file

### Modified:
- ✅ `convex/schema.ts` - Added practiceProjects table
- ✅ `package.json` - Added seed:projects script
- ⏳ `src/App.tsx` - Switch when ready

## Support

If you encounter issues:
1. Check Convex logs: `npx convex logs`
2. Check browser console for errors
3. Verify schema in Convex dashboard
4. Check that all files are saved and synced
