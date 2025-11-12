# Duel System - Immediate Improvements

## 🚨 Critical Fixes (Do These Now)

### 1. Fix Item Selection (30 min)
**Problem:** Random items = unfair duels

**Solution:**
```typescript
// In convex/duels.ts - createDuel
export const createDuel = mutation({
  args: {
    opponentId: v.optional(v.id("users")),
    itemCount: v.optional(v.number()),
    difficulty: v.optional(v.string()), // NEW
    wager: v.optional(v.object({
      type: v.string(),
      amount: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Get challenger's skill level
    const userSkills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", challengerId))
      .collect();
    
    const avgElo = userSkills.length > 0
      ? userSkills.reduce((sum, s) => sum + s.rating, 0) / userSkills.length
      : 1500;
    
    // Pick items near user's Elo (±50)
    const allItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();
    
    const suitableItems = allItems
      .filter(item => Math.abs(item.elo - avgElo) < 50)
      .sort(() => Math.random() - 0.5)
      .slice(0, itemCount);
    
    // Use these instead of random
    const selectedItems = suitableItems.map(i => i._id);
  }
});
```

### 2. Add Duel Parameters UI (45 min)
**Problem:** Can't customize duels

**Solution:**
```typescript
// In components/duels/DuelArena.tsx
const [showCreateModal, setShowCreateModal] = useState(false);
const [duelParams, setDuelParams] = useState({
  itemCount: 5,
  difficulty: "matched",
  stakes: { type: "xp", amount: 50 }
});

<Dialog open={showCreateModal}>
  <DialogContent>
    <h3>Create Duel</h3>
    
    <Label>Number of Items</Label>
    <Select value={duelParams.itemCount} onChange={...}>
      <option value={3}>3 Items (Quick)</option>
      <option value={5}>5 Items (Standard)</option>
      <option value={10}>10 Items (Marathon)</option>
    </Select>
    
    <Label>Difficulty</Label>
    <Select value={duelParams.difficulty} onChange={...}>
      <option value="easy">Easy (-100 Elo)</option>
      <option value="matched">Matched (Your Level)</option>
      <option value="hard">Hard (+100 Elo)</option>
    </Select>
    
    <Label>Stakes</Label>
    <Select value={duelParams.stakes.type} onChange={...}>
      <option value="none">Just for Fun</option>
      <option value="xp">50 XP</option>
      <option value="xp">100 XP</option>
    </Select>
    
    <Button onClick={() => createDuel(duelParams)}>
      Create Challenge
    </Button>
  </DialogContent>
</Dialog>
```

### 3. Improve Item Display (1 hour)
**Problem:** Just shows item ID

**Solution:**
```typescript
// Create components/duels/DuelItem.tsx
export function DuelItem({ item, onSubmit }) {
  // Render based on item template type
  if (item.templateType === "multiple-choice") {
    return <MultipleChoiceItem item={item} onSubmit={onSubmit} />;
  }
  
  if (item.templateType === "prompt-draft") {
    return <PromptDraftItem item={item} onSubmit={onSubmit} />;
  }
  
  // Fallback
  return <GenericItem item={item} onSubmit={onSubmit} />;
}

// Use in duel gameplay page
<DuelItem
  item={currentItem}
  onSubmit={handleSubmit}
/>
```

---

## 🎯 Quick Wins (Do These Next)

### 4. Add Victory Screen (30 min)
```typescript
// components/duels/VictoryScreen.tsx
export function VictoryScreen({ duel, winner, stats }) {
  return (
    <Card className="text-center">
      <Trophy className="h-24 w-24 mx-auto text-amber-500" />
      <h2 className="text-3xl font-bold">
        {winner._id === user._id ? "Victory!" : "Defeat"}
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-gray-600">Your Score</p>
          <p className="text-4xl font-bold">{yourScore}</p>
        </div>
        <div>
          <p className="text-gray-600">Opponent</p>
          <p className="text-4xl font-bold">{opponentScore}</p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={rematch}>Rematch</Button>
        <Button onClick={share}>Share Result</Button>
        <Button onClick={backToArena} variant="outline">
          Back to Arena
        </Button>
      </div>
    </Card>
  );
}
```

### 5. Add Rematch (15 min)
```typescript
// In convex/duels.ts
export const createRematch = mutation({
  args: { originalDuelId: v.id("practiceDuels") },
  handler: async (ctx, args) => {
    const originalDuel = await ctx.db.get(args.originalDuelId);
    
    // Create new duel with same parameters
    return await ctx.db.insert("practiceDuels", {
      challengerId: originalDuel.opponentId, // Swap roles
      opponentId: originalDuel.challengerId,
      itemIds: originalDuel.itemIds, // Same items
      status: "active",
      challengerScore: 0,
      startedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      wager: originalDuel.wager,
    });
  }
});
```

### 6. Add Live Progress Indicator (20 min)
```typescript
// In duel gameplay page
<Card>
  <CardHeader>
    <CardTitle>Opponent Status</CardTitle>
  </CardHeader>
  <CardContent>
    {opponentAttempts.length === 0 ? (
      <p className="text-gray-500">Waiting for opponent to start...</p>
    ) : (
      <>
        <Progress value={opponentProgress} />
        <p className="text-sm mt-2">
          {opponentAttempts.length}/{duel.itemIds.length} items completed
        </p>
        {opponentAttempts.length === duel.itemIds.length && (
          <Badge className="mt-2">Opponent Finished!</Badge>
        )}
      </>
    )}
  </CardContent>
</Card>
```

---

## 📋 Checklist

### Immediate (This Session)
- [x] Fix userId error in submitDuelAttempt ✅
- [ ] Add skill-based item selection
- [ ] Add duel parameters UI
- [ ] Improve item display

### Short Term (This Week)
- [ ] Add victory screen
- [ ] Add rematch functionality
- [ ] Add live progress indicator
- [ ] Add friend challenge UI

### Medium Term (Next Week)
- [ ] Add duel ranking system
- [ ] Add notifications
- [ ] Add share cards
- [ ] Add leaderboards

---

## 🎮 Testing Plan

### Test 1: Fair Item Selection
1. Create duel as beginner user
2. Check items are at beginner level
3. Create duel as advanced user
4. Check items are at advanced level

### Test 2: Complete Duel Flow
1. User A creates duel
2. User B accepts
3. Both complete items
4. Winner determined correctly
5. Stats displayed
6. Rematch works

### Test 3: Edge Cases
1. User tries to answer same item twice → Error
2. User tries to answer item not in duel → Error
3. Duel expires → Can't play
4. Opponent never accepts → Shows in pending

---

## 💡 Key Takeaways

1. **Item selection is critical** - Must be fair and skill-matched
2. **Parameters matter** - Users want control
3. **Feedback is essential** - Show opponent progress
4. **Completion matters** - Victory screen, rematch, share
5. **Social features needed** - Friend challenges, notifications

**Next Step:** Implement the 3 critical fixes above to make duels actually competitive and fair!
