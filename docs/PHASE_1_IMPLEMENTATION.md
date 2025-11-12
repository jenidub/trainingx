# Phase 1 Implementation Guide

This document describes the Phase 1 implementation for the Practice Zone enhancement.

## Overview

Phase 1 converts the prototype into a learner-ready experience with:
- AI-powered prompt evaluation
- Placement test with skill mapping
- Daily drills with streak mechanics
- New normalized schema (feature-flagged)

## What's Been Implemented

### 1. Schema Updates (`convex/schema.ts`)

Added new normalized tables:
- `practiceTracks` - Track definitions (Content, Analytics, Ops, Strategy)
- `practiceScenarios` - Reusable scenario shells
- `practiceItemTemplates` - Templates for content generation
- `practiceItems` - Calibrated question instances with Elo ratings
- `practiceActivities` - Project step definitions
- `practiceAttempts` - Learner responses with AI feedback
- `practiceUserSkills` - Elo-based skill ratings per user
- `practiceReviewDeck` - Spaced repetition scheduling
- `practiceUserPreferences` - User preferences and goals
- `practiceStreaks` - Streak tracking with repair tokens
- `practiceDailyDrills` - Daily drill assignments
- `placementTests` - Placement test results
- `aiEvaluationLogs` - AI evaluation cost tracking
- `featureFlags` - Feature flag management

### 2. AI Evaluation Service (`convex/aiEvaluation.ts`)

Replaces placeholder evaluation with real AI:
- Supports OpenAI and Anthropic providers
- Retry logic with exponential backoff
- Cost tracking and logging
- Rubric-based scoring (clarity, constraints, iteration, tool)
- Structured feedback and suggestions

**Usage:**
```typescript
const result = await ctx.runAction(api.aiEvaluation.evaluatePromptDraft, {
  attemptId: attemptId,
  userPrompt: "Write a blog post about...",
  context: {
    scenario: "You're a content marketer...",
    goal: "Create engaging content",
    constraints: ["500 words", "SEO optimized"],
  },
});
```

### 3. Placement Test (`convex/placementTest.ts`)

12-item adaptive test that:
- Selects balanced items across 6 major skills
- Calculates initial Elo ratings (1300-1700 range)
- Recommends appropriate track based on skill profile
- Initializes `practiceUserSkills` table

**Usage:**
```typescript
// Get or create test
const test = await ctx.runQuery(api.placementTest.getOrCreatePlacementTest, {
  userId: userId,
});

// Submit results
const result = await ctx.runMutation(api.placementTest.submitPlacementTest, {
  userId: userId,
  responses: [
    { itemId: id1, response: "answer", correct: true, timeMs: 30000 },
    // ... 11 more responses
  ],
});
```

### 4. Daily Drills & Streaks (`convex/dailyDrills.ts`)

Micro-practice system with:
- 3-5 items per day
- Priority to review deck items (spaced repetition)
- Targets weakest skills
- Streak tracking with repair tokens
- Automatic streak updates

**Usage:**
```typescript
// Get today's drill
const drill = await ctx.runQuery(api.dailyDrills.getTodaysDrill, {
  userId: userId,
});

// Complete an item
await ctx.runMutation(api.dailyDrills.completeDrillItem, {
  userId: userId,
  drillId: drillId,
  itemId: itemId,
  timeMs: 120000,
});

// Use repair token
await ctx.runMutation(api.dailyDrills.useRepairToken, {
  userId: userId,
});
```

### 5. Migration Utilities (`convex/migrations.ts`)

Backfills new schema from legacy data:
- `seedTracks` - Creates 4 practice tracks
- `seedTemplates` - Creates item templates (MC, prompt-draft, prompt-surgery, tool-selection)
- `migrateLegacyProjects` - Converts legacy projects to new schema
- `runAllMigrations` - Runs all migrations in sequence

**Usage:**
```typescript
// Run all migrations (internal only)
await ctx.runMutation(internal.migrations.runAllMigrations, {});
```

### 6. Frontend Components

**DailyDrill Component** (`components/DailyDrill.tsx`):
- Shows today's drill with progress
- Displays streak information
- Handles item completion
- Shows completion celebration

**PlacementTest Component** (`components/PlacementTest.tsx`):
- 12-question adaptive test
- Progress tracking
- Results display with skill ratings
- Track recommendation

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Choose provider
AI_EVAL_PROVIDER=openai  # or anthropic

# Add API key
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Enable features
ENABLE_AI_EVALUATION=true
ENABLE_PLACEMENT_TEST=true
ENABLE_DAILY_DRILLS=true
```

### 2. Run Migrations

The migrations will run automatically on first use, or you can trigger them manually:

```typescript
// In Convex dashboard or via internal action
await ctx.runMutation(internal.migrations.runAllMigrations, {});
```

This will:
1. Create 4 practice tracks
2. Create 4 item templates
3. Migrate legacy project steps to practice items

### 3. Deploy Schema

```bash
npx convex deploy
```

### 4. Test Components

Add to your dashboard or practice page:

```tsx
import { DailyDrill } from "@/components/DailyDrill";
import { PlacementTest } from "@/components/PlacementTest";

// In your component
<PlacementTest userId={userId} onComplete={() => console.log("Test complete!")} />
<DailyDrill userId={userId} />
```

## API Costs

Estimated costs per evaluation:
- **OpenAI GPT-4o-mini**: ~$0.0002 per evaluation
- **Anthropic Claude 3.5 Sonnet**: ~$0.002 per evaluation

For 1000 daily active users doing 5 evaluations each:
- OpenAI: ~$1/day
- Anthropic: ~$10/day

## Feature Flags

Control rollout via environment variables:
- `ENABLE_AI_EVALUATION` - Enable AI-powered evaluation
- `ENABLE_PLACEMENT_TEST` - Enable placement test
- `ENABLE_DAILY_DRILLS` - Enable daily drills

## Next Steps (Phase 2)

Phase 1 provides the foundation. Phase 2 will add:
1. Elo-based difficulty engine
2. Parametric content generation
3. Coach panel
4. Full spaced repetition system
5. Analytics dashboards

## Monitoring

Track these metrics:
- Placement test completion rate (target: ≥70%)
- Daily drill adoption (target: ≥40% of WAU)
- AI evaluation success rate (target: ≥95%)
- Average evaluation latency (target: <3s)
- Cost per evaluation

## Troubleshooting

### AI Evaluation Fails
- Check API keys in environment
- Verify provider is set correctly
- Check rate limits
- Review logs in `aiEvaluationLogs` table

### Placement Test Not Loading
- Ensure migrations have run
- Check that practice items exist
- Verify user has not already completed test

### Daily Drills Empty
- User must complete placement test first
- Ensure practice items are seeded
- Check that user has skill ratings

## Support

For issues or questions:
1. Check the phase plan docs in `docs/practice-plan/`
2. Review schema in `convex/schema.ts`
3. Check migration status in Convex dashboard
