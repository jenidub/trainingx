# Phase 1 Quick Reference

## API Endpoints

### AI Evaluation
```typescript
// Evaluate a prompt draft
const result = await ctx.runAction(api.aiEvaluation.evaluatePromptDraft, {
  attemptId: attemptId,
  userPrompt: "Your prompt here...",
  context: {
    scenario: "Context description",
    goal: "What to achieve",
    constraints: ["Constraint 1", "Constraint 2"],
  },
});

// Returns:
// {
//   rubricScores: { clarity: 85, constraints: 90, iteration: 75, tool: 80 },
//   overallScore: 82.5,
//   feedback: "Your prompt is clear and well-structured...",
//   suggestions: ["Add more specific examples", "Include iteration guidance"]
// }
```

### Placement Test
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
    // ... 11 more
  ],
});

// Returns:
// {
//   testId: Id<"placementTests">,
//   initialSkillRatings: { generative_ai: 1650, ... },
//   recommendedTrack: "content"
// }
```

### Daily Drills
```typescript
// Get today's drill
const drill = await ctx.runQuery(api.dailyDrills.getTodaysDrill, {
  userId: userId,
});

// Create drill if doesn't exist
const drillId = await ctx.runMutation(api.dailyDrills.createTodaysDrill, {
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

// Get streak info
const streak = await ctx.runQuery(api.dailyDrills.getUserStreak, {
  userId: userId,
});
```

### Migrations
```typescript
// Run all migrations (internal only)
await ctx.runMutation(internal.migrations.runAllMigrations, {});

// Individual migrations
await ctx.runMutation(internal.migrations.seedTracks, {});
await ctx.runMutation(internal.migrations.seedTemplates, {});
await ctx.runMutation(internal.migrations.migrateLegacyProjects, {});
```

## React Components

### Placement Test
```tsx
import { PlacementTest } from "@/components/PlacementTest";

<PlacementTest 
  userId={currentUser._id}
  onComplete={() => {
    console.log("Test complete!");
    router.push("/dashboard");
  }}
/>
```

### Daily Drill
```tsx
import { DailyDrill } from "@/components/DailyDrill";

<DailyDrill userId={currentUser._id} />
```

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Optional
AI_EVAL_PROVIDER=openai  # or anthropic
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Feature Flags
ENABLE_AI_EVALUATION=true
ENABLE_PLACEMENT_TEST=true
ENABLE_DAILY_DRILLS=true
```

## Database Schema

### Key Tables

**practiceItems** - Calibrated questions
```typescript
{
  templateId: Id<"practiceItemTemplates">,
  scenarioId?: Id<"practiceScenarios">,
  params: any,
  elo: number,              // 1500 baseline
  eloDeviation: number,     // 350 initial
  difficultyBand: "foundation" | "core" | "challenge",
  tags: string[],           // skill tags
  status: "live" | "retired" | "experimental"
}
```

**practiceAttempts** - User responses
```typescript
{
  userId: Id<"users">,
  itemId: Id<"practiceItems">,
  response: any,
  rubricScores?: { clarity, constraints, iteration, tool },
  score: number,
  correct: boolean,
  timeMs: number,
  aiFeedback?: { summary, suggestions }
}
```

**practiceUserSkills** - Skill ratings
```typescript
{
  userId: Id<"users">,
  skillId: string,          // "generative_ai", etc.
  rating: number,           // Elo value
  deviation: number,        // uncertainty
  lastUpdated: number
}
```

**practiceStreaks** - Engagement tracking
```typescript
{
  userId: Id<"users">,
  currentStreak: number,
  longestStreak: number,
  lastPracticeDate: number,
  repairTokens: number,     // 2 initial
  totalDrillsCompleted: number
}
```

## Common Patterns

### Check if user completed placement
```typescript
const placementTest = await ctx.db
  .query("placementTests")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .first();

if (!placementTest) {
  // Show placement test
}
```

### Get user's weakest skills
```typescript
const skills = await ctx.db
  .query("practiceUserSkills")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect();

skills.sort((a, b) => a.rating - b.rating);
const weakest = skills.slice(0, 3);
```

### Track AI evaluation costs
```typescript
const logs = await ctx.db
  .query("aiEvaluationLogs")
  .withIndex("by_date", (q) => 
    q.gte("createdAt", startDate).lte("createdAt", endDate)
  )
  .collect();

const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
const avgLatency = logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length;
```

## Troubleshooting

### AI Evaluation fails
```typescript
// Check logs
const logs = await ctx.db
  .query("aiEvaluationLogs")
  .withIndex("by_attempt", (q) => q.eq("attemptId", attemptId))
  .collect();

console.log(logs[0].errorMessage);
```

### Placement test not loading
```typescript
// Check if items exist
const items = await ctx.db
  .query("practiceItems")
  .withIndex("by_status", (q) => q.eq("status", "live"))
  .take(12);

if (items.length < 12) {
  // Run migrations
}
```

### Daily drill empty
```typescript
// Check user skills
const skills = await ctx.db
  .query("practiceUserSkills")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect();

if (skills.length === 0) {
  // User needs to complete placement test
}
```

## Monitoring Queries

### Daily active users
```typescript
const today = new Date().toISOString().split("T")[0];
const drills = await ctx.db
  .query("practiceDailyDrills")
  .withIndex("by_date", (q) => q.eq("date", today))
  .collect();

const dau = new Set(drills.map(d => d.userId)).size;
```

### Placement completion rate
```typescript
const tests = await ctx.db.query("placementTests").collect();
const users = await ctx.db.query("users").collect();
const completionRate = (tests.length / users.length) * 100;
```

### Average streak
```typescript
const streaks = await ctx.db.query("practiceStreaks").collect();
const avgStreak = streaks.reduce((sum, s) => sum + s.currentStreak, 0) / streaks.length;
```

## Cost Optimization

### Use OpenAI for lower costs
```bash
AI_EVAL_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini  # ~$0.0002 per eval
```

### Batch evaluations
```typescript
// Instead of evaluating each attempt immediately,
// queue them and process in batches
const pendingAttempts = await ctx.db
  .query("practiceAttempts")
  .filter((q) => q.eq(q.field("aiFeedback"), undefined))
  .take(10);

// Process batch
for (const attempt of pendingAttempts) {
  await evaluatePromptDraft({ attemptId: attempt._id, ... });
}
```

### Cache common evaluations
```typescript
// For MC questions, no AI evaluation needed
if (template.type === "multiple-choice") {
  // Simple correctness check
  return { correct: response === correctAnswer };
}
```

## Next Steps

See `docs/practice-plan/phase-2-adaptivity.md` for Phase 2 features:
- Elo-based difficulty engine
- Parametric content generation
- Coach panel
- Full spaced repetition
