import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { mapPracticeTagsToSkills } from "./skillTags";

/**
 * Daily Drills & Streak System
 * Micro-practice surface (3-5 items) with streak logic and repair tokens
 */

// Get today's drill for user
export const getTodaysDrill = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if drill already exists for today
    const drill = await ctx.db
      .query("practiceDailyDrills")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (!drill) {
      // No drill yet - return null, client should call createTodaysDrill
      return null;
    }

    // Get streak info
    const streak = await ctx.db
      .query("practiceStreaks")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    // Load item details
    const items = await Promise.all(
      drill.itemIds.map(id => ctx.db.get(id))
    );

    return {
      drill,
      items: items.filter(Boolean),
      streak: streak || null,
    };
  },
});

// Create today's drill (mutation)
export const createTodaysDrill = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = new Date().toISOString().split("T")[0];

    // Check if already exists
    const existing = await ctx.db
      .query("practiceDailyDrills")
      .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", today))
      .first();

    if (existing) {
      return existing._id;
    }

    // Generate new drill
    const items = await selectDrillItems(ctx, userId);
    
    if (items.length === 0) {
      throw new Error("No items available for drill");
    }

    const drillId = await ctx.db.insert("practiceDailyDrills", {
      userId,
      date: today,
      itemIds: items.map((i: any) => i._id),
      completedItemIds: [],
      status: "pending",
      timeSpentMs: 0,
    });

    // Ensure streak exists
    await getOrCreateStreakMutation(ctx, userId);

    return drillId;
  },
});

// Helper to get or create streak in mutation context
async function getOrCreateStreakMutation(ctx: any, userId: Id<"users">) {
  let streak = await ctx.db
    .query("practiceStreaks")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!streak) {
    const streakId = await ctx.db.insert("practiceStreaks", {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: 0,
      repairTokens: 2,
      totalDrillsCompleted: 0,
      updatedAt: Date.now(),
    });
    streak = await ctx.db.get(streakId);
  }

  return streak!;
}

// Select 3-5 items for daily drill
async function selectDrillItems(ctx: any, userId: Id<"users">) {
  // Priority 1: Review deck items due today
  const reviewItems = await ctx.db
    .query("practiceReviewDeck")
    .withIndex("by_user_due", (q: any) => 
      q.eq("userId", userId).lte("dueAt", Date.now())
    )
    .take(3);

  const selectedIds = new Set(reviewItems.map((r: any) => r.itemId));

  // Priority 2: Items targeting weakest skills
  const userSkills = await ctx.db
    .query("practiceUserSkills")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  // Sort by rating (lowest first)
  userSkills.sort((a: any, b: any) => a.rating - b.rating);
  const weakestSkills = userSkills.slice(0, 3).map((s: any) => s.skillId);

  // Find items for weak skills
  const allItems = await ctx.db
    .query("practiceItems")
    .withIndex("by_status", (q: any) => q.eq("status", "live"))
    .collect();

  const weakSkillItems = allItems.filter((item: any) => {
    const itemSkills = mapPracticeTagsToSkills(item.tags);
    return (
      itemSkills.some((skill: string) => weakestSkills.includes(skill)) &&
      !selectedIds.has(item._id)
    );
  });

  // Shuffle and take up to 2 more items
  const shuffled = weakSkillItems.sort(() => Math.random() - 0.5);
  const additionalItems = shuffled.slice(0, Math.max(0, 5 - selectedIds.size));

  // Combine review items and new items
  const reviewItemDetails = await Promise.all(
    reviewItems.map((r: any) => ctx.db.get(r.itemId))
  );

  return [...reviewItemDetails, ...additionalItems].filter(Boolean);
}

// Get or create streak record
async function getOrCreateStreak(ctx: any, userId: Id<"users">) {
  let streak = await ctx.db
    .query("practiceStreaks")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!streak) {
    const streakId = await ctx.db.insert("practiceStreaks", {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: 0,
      repairTokens: 2, // Start with 2 repair tokens
      totalDrillsCompleted: 0,
      updatedAt: Date.now(),
    });
    streak = await ctx.db.get(streakId);
  }

  return streak!;
}

// Complete a drill item
export const completeDrillItem = mutation({
  args: {
    userId: v.id("users"),
    drillId: v.id("practiceDailyDrills"),
    itemId: v.id("practiceItems"),
    timeMs: v.number(),
    correct: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, drillId, itemId, timeMs, correct }) => {
    const drill = await ctx.db.get(drillId);
    if (!drill || drill.userId !== userId) {
      throw new Error("Drill not found");
    }

    // Get item to update skills
    const item = await ctx.db.get(itemId);
    
    // Update skill ratings if we know correctness
    if (item && correct !== undefined) {
      const practiceUserSkills = await import("./practiceUserSkills");

      const skillIds = mapPracticeTagsToSkills(item.tags);
      const itemDifficulty = item.elo ?? 1500;

      // Update each skill the item tests
      for (const skillId of skillIds) {
        await practiceUserSkills.updateSkillRating(
          ctx,
          userId,
          skillId,
          itemDifficulty,
          correct
        );
      }
    }

    // Add to completed items
    const completedItemIds = [...drill.completedItemIds, itemId];
    const allCompleted = completedItemIds.length === drill.itemIds.length;

    await ctx.db.patch(drillId, {
      completedItemIds,
      status: allCompleted ? "completed" : "in_progress",
      completedAt: allCompleted ? Date.now() : undefined,
      timeSpentMs: drill.timeSpentMs + timeMs,
    });

    // If all items completed, update streak
    if (allCompleted) {
      await updateStreak(ctx, userId);
    }

    return { completed: allCompleted };
  },
});

// Update user streak
async function updateStreak(ctx: any, userId: Id<"users">) {
  const streak = await getOrCreateStreak(ctx, userId);
  const today = Date.now();
  const lastPractice = streak.lastPracticeDate;
  
  // Check if last practice was yesterday
  const oneDayMs = 24 * 60 * 60 * 1000;
  const daysSinceLastPractice = Math.floor((today - lastPractice) / oneDayMs);

  let newStreak = streak.currentStreak;
  
  if (daysSinceLastPractice === 0) {
    // Already practiced today, no change
    return;
  } else if (daysSinceLastPractice === 1) {
    // Consecutive day, increment streak
    newStreak = streak.currentStreak + 1;
  } else if (daysSinceLastPractice > 1) {
    // Streak broken, reset to 1
    newStreak = 1;
  }

  await ctx.db.patch(streak._id, {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, streak.longestStreak),
    lastPracticeDate: today,
    totalDrillsCompleted: streak.totalDrillsCompleted + 1,
    updatedAt: today,
  });
}

// Use repair token to restore streak
export const useRepairToken = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const streak = await getOrCreateStreak(ctx, userId);

    if (streak.repairTokens <= 0) {
      throw new Error("No repair tokens available");
    }

    // Restore streak by setting last practice to yesterday
    const yesterday = Date.now() - (24 * 60 * 60 * 1000);

    await ctx.db.patch(streak._id, {
      repairTokens: streak.repairTokens - 1,
      lastPracticeDate: yesterday,
      updatedAt: Date.now(),
    });

    return { success: true, remainingTokens: streak.repairTokens - 1 };
  },
});

// Get user streak info
export const getUserStreak = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await getOrCreateStreak(ctx, userId);
  },
});

// Get drill history
export const getDrillHistory = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 30 }) => {
    const drills = await ctx.db
      .query("practiceDailyDrills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return drills;
  },
});
