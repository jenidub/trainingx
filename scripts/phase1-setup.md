# Phase 1 Setup Script

Follow these steps to deploy Phase 1 features:

## 1. Prerequisites

Ensure you have:
- Node.js 18+ installed
- Convex CLI installed (`npm install -g convex`)
- OpenAI or Anthropic API key

## 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your API keys
# Required variables:
# - OPENAI_API_KEY or ANTHROPIC_API_KEY
# - AI_EVAL_PROVIDER (openai or anthropic)
```

## 3. Deploy Schema

```bash
# Deploy to Convex
npx convex deploy

# This will:
# - Push new schema tables
# - Deploy all functions
# - Generate TypeScript types
```

## 4. Run Migrations

Option A: Via Convex Dashboard
1. Go to your Convex dashboard
2. Navigate to Functions
3. Run `migrations:runAllMigrations` (internal mutation)

Option B: Via CLI (if you have admin access)
```bash
npx convex run migrations:runAllMigrations --prod
```

This will:
- Create 4 practice tracks (Content, Analytics, Ops, Strategy)
- Create item templates (MC, prompt-draft, prompt-surgery, tool-selection)
- Migrate legacy project steps to new practice items

## 5. Verify Setup

Check in Convex dashboard that these tables have data:
- `practiceTracks` (should have 4 rows)
- `practiceItemTemplates` (should have 2-4 rows)
- `practiceItems` (should have items from legacy projects)

## 6. Test Features

### Test Placement Test
```tsx
import { PlacementTest } from "@/components/PlacementTest";

// In your page
<PlacementTest 
  userId={currentUser._id} 
  onComplete={() => console.log("Test complete!")} 
/>
```

### Test Daily Drills
```tsx
import { DailyDrill } from "@/components/DailyDrill";

// In your dashboard
<DailyDrill userId={currentUser._id} />
```

## 7. Monitor

Track these in Convex dashboard:
- `aiEvaluationLogs` - AI evaluation costs and performance
- `placementTests` - Completion rate
- `practiceStreaks` - Engagement metrics
- `practiceDailyDrills` - Daily active users

## 8. Feature Flags

Control rollout via environment variables:
```bash
ENABLE_AI_EVALUATION=true
ENABLE_PLACEMENT_TEST=true
ENABLE_DAILY_DRILLS=true
```

## Troubleshooting

### Schema deployment fails
- Ensure you're on latest Convex version
- Check for syntax errors in schema.ts
- Try `npx convex dev` first to test locally

### Migrations fail
- Ensure schema is deployed first
- Check that system user can be created
- Verify legacy practiceProjects table exists

### Components show errors
- Run `npx convex dev` to regenerate types
- Restart your dev server
- Check that API functions are exported correctly

## Cost Estimates

With 1000 daily active users:
- OpenAI (GPT-4o-mini): ~$1-2/day
- Anthropic (Claude 3.5 Sonnet): ~$10-15/day

Start with OpenAI for lower costs during testing.

## Next Steps

Once Phase 1 is stable:
1. Monitor metrics for 1-2 weeks
2. Gather user feedback
3. Begin Phase 2 planning (adaptive engine)
4. Backfill scenario content per content-brief.md
