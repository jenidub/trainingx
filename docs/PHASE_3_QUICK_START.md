# Phase 3 Quick Start Guide

## Overview
Phase 3 adds creator tools, competitive play, quests, and social features to drive engagement and community growth.

## Quick Setup

### 1. Deploy Convex Functions
```bash
npx convex deploy
```

This deploys:
- `creatorStudio.ts` - UGC creation system
- `duels.ts` - Competitive play
- `quests.ts` - Challenge system
- `moderation.ts` - Content review
- `sharing.ts` - Social features

### 2. Add Creator Studio to App

```tsx
// In app/(routes)/creator/page.tsx
import { CreatorStudioEntry } from "@/components/creator/CreatorStudioEntry";

export default function CreatorPage() {
  return <CreatorStudioEntry />;
}
```

### 3. Add Duel Arena

```tsx
// In app/(routes)/duels/page.tsx
import { DuelArena } from "@/components/duels/DuelArena";

export default function DuelsPage() {
  return <DuelArena />;
}
```

## Using Creator Studio

### Create a Draft

```typescript
const draftId = await ctx.runMutation(api.creatorStudio.createDraft, {
  type: "item",
  title: "Email Writing Challenge",
  description: "Practice writing professional emails",
  content: {
    itemType: "prompt-draft",
    scenario: "Write an email to a client",
    skills: ["communication", "clarity"],
    rubric: {
      weights: { clarity: 0.4, constraints: 0.3, iteration: 0.3 },
      maxScore: 100
    }
  },
  metadata: {
    skills: ["communication", "clarity"],
    difficulty: "core",
    estimatedTime: 300,
    tags: ["email", "business"]
  }
});
```

### Submit for Review

```typescript
const result = await ctx.runMutation(api.creatorStudio.submitDraft, {
  draftId: draftId
});

if (result.success) {
  console.log("Draft submitted for review!");
} else {
  console.log("Validation errors:", result.errors);
}
```

### Get User's Drafts

```typescript
const drafts = await ctx.runQuery(api.creatorStudio.getUserDrafts, {
  status: "draft" // or "pending", "published", etc.
});
```

## Using Duels

### Create a Duel

```typescript
const { duelId, itemIds } = await ctx.runMutation(api.duels.createDuel, {
  itemCount: 5, // Number of items in duel
  wager: {
    type: "xp",
    amount: 50
  }
});
```

### Accept a Duel

```typescript
await ctx.runMutation(api.duels.acceptDuel, {
  duelId: duelId
});
```

### Submit Duel Attempt

```typescript
await ctx.runMutation(api.duels.submitDuelAttempt, {
  duelId: duelId,
  itemId: itemId,
  response: userResponse,
  score: 85,
  correct: true,
  timeMs: 45000
});
```

### Get Duel Stats

```typescript
const stats = await ctx.runQuery(api.duels.getDuelStats, {
  userId: user._id
});

console.log(`Win rate: ${stats.winRate}%`);
console.log(`Total wins: ${stats.wins}`);
```

## Using Quests

### Create a Quest (Admin)

```typescript
const questId = await ctx.runMutation(api.quests.createQuest, {
  title: "Weekly Warrior",
  description: "Complete 10 practice items this week",
  type: "weekly",
  requirements: [
    {
      type: "complete_items",
      target: null,
      progress: 0,
      goal: 10
    }
  ],
  rewards: {
    xp: 500,
    badges: ["weekly_warrior"],
    unlocks: ["premium_pack_1"]
  },
  startDate: Date.now(),
  endDate: Date.now() + 7 * 24 * 60 * 60 * 1000
});
```

### Start a Quest

```typescript
const { userQuestId } = await ctx.runMutation(api.quests.startQuest, {
  questId: questId
});
```

### Update Quest Progress (Automatic)

```typescript
// Called automatically when events occur
await ctx.runMutation(api.quests.updateQuestProgress, {
  userId: user._id,
  eventType: "item_completed",
  eventData: {}
});
```

### Claim Quest Rewards

```typescript
const { rewards } = await ctx.runMutation(api.quests.claimQuestRewards, {
  userQuestId: userQuestId
});

console.log("Earned:", rewards);
```

## Using Moderation

### Flag Content

```typescript
await ctx.runMutation(api.moderation.flagContent, {
  contentId: draftId,
  contentType: "draft",
  reason: "inappropriate",
  description: "Contains offensive language"
});
```

### Review Flags (Moderator)

```typescript
const flags = await ctx.runQuery(api.moderation.getPendingFlags, {
  limit: 20
});
```

### Resolve Flag (Moderator)

```typescript
await ctx.runMutation(api.moderation.resolveFlag, {
  flagId: flagId,
  resolution: "Content removed for violating guidelines",
  action: "remove_content"
});
```

## Using Sharing

### Create Share Card

```typescript
const { shareUrl } = await ctx.runMutation(api.sharing.createShareCard, {
  type: "duel_win",
  title: "Victory!",
  description: "Just won a duel with 95% accuracy",
  stats: {
    score: 475,
    accuracy: 95,
    opponent: "Player123"
  }
});

console.log("Share at:", shareUrl);
```

### Create Referral Code

```typescript
const { referralCode } = await ctx.runMutation(api.sharing.createReferralCode, {});

console.log("Your referral code:", referralCode);
```

### Apply Referral Code

```typescript
const { rewards } = await ctx.runMutation(api.sharing.applyReferralCode, {
  code: "ABC123XYZ"
});

console.log("Rewards earned:", rewards);
```

## Event Tracking for Quests

Quest progress updates automatically when these events occur:

```typescript
// After item completion
await updateQuestProgress({
  userId,
  eventType: "item_completed",
  eventData: {}
});

// After duel win
await updateQuestProgress({
  userId,
  eventType: "duel_won",
  eventData: {}
});

// After earning score
await updateQuestProgress({
  userId,
  eventType: "score_earned",
  eventData: { score: 100 }
});

// After practicing skill
await updateQuestProgress({
  userId,
  eventType: "skill_practiced",
  eventData: { skill: "communication" }
});

// After daily practice
await updateQuestProgress({
  userId,
  eventType: "daily_practice",
  eventData: {}
});
```

## Common Patterns

### Creator Workflow
```typescript
// 1. Create draft
const { draftId } = await createDraft({ ... });

// 2. Edit and validate
await updateDraft({ draftId, content: updatedContent });

// 3. Submit when ready
await submitDraft({ draftId });

// 4. Monitor status
const draft = await getDraft({ draftId });
console.log("Status:", draft.status);
```

### Duel Workflow
```typescript
// 1. Create or accept duel
const { duelId } = await createDuel({ itemCount: 5 });

// 2. Complete items
for (const itemId of itemIds) {
  const response = await getUserResponse(itemId);
  await submitDuelAttempt({ duelId, itemId, ...response });
}

// 3. Check results
const details = await getDuelDetails({ duelId });
console.log("Winner:", details.duel.winnerId);
```

### Quest Workflow
```typescript
// 1. Get active quests
const quests = await getActiveQuests({ type: "weekly" });

// 2. Start quest
await startQuest({ questId: quests[0]._id });

// 3. Progress tracked automatically
// ... user completes activities ...

// 4. Claim rewards when complete
const userQuests = await getUserQuests({ status: "completed" });
await claimQuestRewards({ userQuestId: userQuests[0]._id });
```

## Testing

### Test Creator Studio
```bash
# In Convex dashboard:
api.creatorStudio.createDraft({
  type: "item",
  title: "Test Item",
  description: "This is a test item for validation",
  content: { itemType: "multiple-choice" },
  metadata: { skills: ["test"], tags: [] }
})
```

### Test Duels
```bash
# Create duel
api.duels.createDuel({ itemCount: 3 })

# Get open duels
api.duels.getOpenDuels({ limit: 10 })
```

### Test Quests
```bash
# Get active quests
api.quests.getActiveQuests({})

# Start quest
api.quests.startQuest({ questId: "..." })
```

## Troubleshooting

### Draft validation failing?
- Check title length (min 10 chars)
- Check description length (min 50 chars)
- Ensure 1-5 skill tags
- Verify type-specific requirements

### Duel not completing?
- Verify both players completed all items
- Check duel hasn't expired
- Ensure items are from duel's itemIds array

### Quest progress not updating?
- Verify event type matches requirement type
- Check event data includes required fields
- Ensure quest is in "in_progress" status

### Referral code not working?
- Check code hasn't been used
- Verify user isn't using own code
- Ensure code exists in database

## Next Steps

1. **Build UI Pages**: Create full editor pages for creator studio
2. **Add Moderator Dashboard**: Build admin interface for content review
3. **Create Quest UI**: Display active quests and progress
4. **Design Share Cards**: Create visual templates for sharing
5. **Launch Season 1**: Create first themed season with quests

## Resources

- [Phase 3 Implementation Doc](./PHASE_3_IMPLEMENTATION.md)
- [Creator Studio Spec](../practice-plan/creator-studio-spec.md)
- [Convex Documentation](https://docs.convex.dev)
