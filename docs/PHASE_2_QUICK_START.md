# Phase 2 Quick Start Guide

## Overview
Phase 2 adds adaptive learning with Elo-based difficulty, spaced repetition, and personalized coaching.

## Quick Setup

### 1. Deploy Convex Functions
```bash
npx convex deploy
```

This deploys:
- `adaptiveEngine.ts` - Elo rating system
- `spacedRepetition.ts` - Review deck
- `itemTemplates.ts` - Content generation
- `analytics.ts` - Metrics tracking

### 2. Add Coach Panel to Dashboard

```tsx
// In app/(routes)/dashboard/page.tsx
import { CoachPanel } from "@/components/CoachPanel";

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Existing dashboard content */}
      
      <CoachPanel userId={user._id} />
    </div>
  );
}
```

### 3. Create Initial Templates (Optional)

Use Convex dashboard or create a seed script:

```typescript
// Example: Create a multiple-choice template
await ctx.runMutation(api.itemTemplates.createTemplate, {
  type: "multiple-choice",
  title: "Prompt Quality Assessment",
  description: "Identify the best prompt for a given scenario",
  schema: {
    scenario: "string",
    options: "array",
    correctIndex: "number"
  },
  rubric: {
    rubricId: "prompt-quality",
    weights: { clarity: 0.4, constraints: 0.3, iteration: 0.3 },
    maxScore: 100
  },
  aiEvaluation: {
    enabled: false
  },
  recommendedTime: 120, // seconds
  skills: ["clarity", "communication"],
  authorId: userId
});
```

### 4. Generate Practice Items

```typescript
// Generate 5 variations of an item
await ctx.runMutation(api.itemTemplates.batchGenerateItems, {
  templateId: templateId,
  paramVariations: [
    { scenario: "Email to client", tone: "professional" },
    { scenario: "Email to team", tone: "casual" },
    { scenario: "Email to executive", tone: "formal" },
    { scenario: "Email to support", tone: "helpful" },
    { scenario: "Email to vendor", tone: "business" },
  ],
  createdBy: userId
});
```

## Using Adaptive Features

### Adaptive Item Picker

```typescript
// Get next best item for user
const nextItem = await ctx.runQuery(api.adaptiveEngine.pickNextItem, {
  userId: user._id,
  excludeItemIds: [], // Items already shown
  skillFilter: "communication" // Optional: target specific skill
});
```

### After User Completes Item

```typescript
// Update skill rating
await ctx.runMutation(api.adaptiveEngine.updateSkillRating, {
  userId: user._id,
  skillId: "communication",
  itemElo: 1550,
  correct: true
});

// Update item difficulty
await ctx.runMutation(api.adaptiveEngine.updateItemElo, {
  itemId: item._id,
  userRating: 1500,
  correct: true
});

// Add to review deck if needed
if (score < 80) {
  await ctx.runMutation(api.spacedRepetition.addToReviewDeck, {
    userId: user._id,
    itemId: item._id,
    quality: 3 // 0-5 scale based on performance
  });
}
```

### Review Session

```typescript
// Get items due for review
const dueItems = await ctx.runQuery(api.spacedRepetition.getDueReviews, {
  userId: user._id,
  limit: 5
});

// After review, update schedule
await ctx.runMutation(api.spacedRepetition.addToReviewDeck, {
  userId: user._id,
  itemId: item._id,
  quality: 4 // User's recall quality (0-5)
});
```

## Monitoring & Analytics

### Check System Health

```typescript
// Elo convergence
const convergence = await ctx.runQuery(api.analytics.getEloConvergence, {
  templateId: templateId
});
console.log(`Convergence rate: ${convergence.convergenceRate}%`);

// AI costs
const costs = await ctx.runQuery(api.analytics.getAIEvaluationCosts, {
  days: 7
});
console.log(`Total cost: $${costs.totalCost}`);

// User progress
const bandConversion = await ctx.runQuery(
  api.analytics.getDifficultyBandConversion,
  { userId: user._id }
);
```

### View User Skill Ratings

```typescript
const skills = await ctx.runQuery(api.adaptiveEngine.getUserSkillRatings, {
  userId: user._id
});

skills.forEach(skill => {
  console.log(`${skill.skillId}: ${skill.rating} (${skill.band})`);
});
```

## Integration with Existing Features

### Daily Drills
Enhance daily drills with adaptive picker:

```typescript
// In convex/dailyDrills.ts
const adaptiveItem = await ctx.runQuery(api.adaptiveEngine.pickNextItem, {
  userId: userId,
  excludeItemIds: alreadySelectedItems
});
```

### Practice Projects
Add adaptive activities to projects:

```typescript
// When user starts a project step
const nextActivity = await ctx.runQuery(api.adaptiveEngine.pickNextItem, {
  userId: userId,
  skillFilter: projectStep.targetSkill
});
```

## Testing

### Test Adaptive Picker
```bash
# In Convex dashboard, run:
api.adaptiveEngine.pickNextItem({ 
  userId: "test-user-id",
  excludeItemIds: []
})
```

### Test Review Deck
```bash
# Add test item to deck
api.spacedRepetition.addToReviewDeck({
  userId: "test-user-id",
  itemId: "test-item-id",
  quality: 3
})

# Check due items
api.spacedRepetition.getDueReviews({
  userId: "test-user-id",
  limit: 10
})
```

## Common Patterns

### Adaptive Practice Session Flow
```typescript
// 1. Get user's weakest skill
const weakest = await getWeakestSkill({ userId });

// 2. Pick item targeting that skill
const item = await pickNextItem({ 
  userId, 
  skillFilter: weakest.skillId 
});

// 3. User completes item
// ... user interaction ...

// 4. Update ratings
await updateSkillRating({ userId, skillId, itemElo, correct });
await updateItemElo({ itemId, userRating, correct });

// 5. Schedule review if needed
if (needsReview) {
  await addToReviewDeck({ userId, itemId, quality });
}
```

### Content Generation Workflow
```typescript
// 1. Create template
const templateId = await createTemplate({ ... });

// 2. Generate variations
await batchGenerateItems({
  templateId,
  paramVariations: [...]
});

// 3. Monitor convergence
const stats = await getTemplateStats({ templateId });

// 4. Adjust if needed
if (stats.averageElo < 1400) {
  // Items too easy, create harder variations
}
```

## Troubleshooting

### Items not converging?
- Check if enough users are attempting items (need 20-30 attempts)
- Verify K-factor is appropriate (default: 32)
- Ensure item difficulty is reasonable

### Review deck not working?
- Verify `dueAt` timestamps are correct
- Check SM-2 parameters (ease factor, intervals)
- Ensure quality scores are in 0-5 range

### Adaptive picker returning null?
- Check if items exist with matching skills
- Verify user has skill ratings initialized
- Ensure items are marked as "live" status

## Next Steps

1. **Create Content**: Author templates and generate item pool
2. **Integrate UI**: Add Coach Panel and review pages
3. **Monitor Metrics**: Track convergence and user engagement
4. **Tune Parameters**: Adjust K-factors and SM-2 settings
5. **Scale Up**: Add more templates and scenarios

## Resources

- [Phase 2 Implementation Doc](./PHASE_2_IMPLEMENTATION.md)
- [Elo Rating System](https://en.wikipedia.org/wiki/Elo_rating_system)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Convex Documentation](https://docs.convex.dev)
