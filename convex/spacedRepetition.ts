import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// SM-2 Algorithm constants
const EASE_FACTOR_MIN = 1.3;
const EASE_FACTOR_DEFAULT = 2.5;
const INTERVAL_MULTIPLIER = 2.5;

// Calculate next review interval using SM-2 algorithm
function calculateNextReview(
  quality: number, // 0-5 scale (0=complete blackout, 5=perfect)
  stability: number,
  difficulty: number,
  lapseCount: number
): { nextStability: number; nextDifficulty: number; nextDueAt: number } {
  let nextStability = stability;
  let nextDifficulty = difficulty;

  if (quality < 3) {
    // Failed recall - reset to 1 day
    nextStability = 1;
    nextDifficulty = Math.min(difficulty + 0.2, 1);
  } else {
    // Successful recall
    if (stability === 0) {
      // First review
      nextStability = quality === 5 ? 4 : quality === 4 ? 3 : 1;
    } else {
      // Subsequent reviews
      const easeFactor = Math.max(
        EASE_FACTOR_MIN,
        EASE_FACTOR_DEFAULT + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );
      nextStability = stability * easeFactor;
    }
    nextDifficulty = Math.max(0, difficulty - 0.1);
  }

  // Calculate due date (in milliseconds)
  const daysUntilDue = Math.ceil(nextStability);
  const nextDueAt = Date.now() + daysUntilDue * 24 * 60 * 60 * 1000;

  return { nextStability, nextDifficulty, nextDueAt };
}

// Add item to review deck
export const addToReviewDeck = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.id("practiceItems"),
    quality: v.number(), // 0-5
  },
  handler: async (ctx, args) => {
    const { userId, itemId, quality } = args;

    // Check if item already in deck
    const existing = await ctx.db
      .query("practiceReviewDeck")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("itemId"), itemId))
      .first();

    if (existing) {
      // Update existing card
      const { nextStability, nextDifficulty, nextDueAt } = calculateNextReview(
        quality,
        existing.stability,
        existing.difficulty,
        existing.lapseCount
      );

      const newLapseCount = quality < 3 ? existing.lapseCount + 1 : existing.lapseCount;

      await ctx.db.patch(existing._id, {
        dueAt: nextDueAt,
        stability: nextStability,
        difficulty: nextDifficulty,
        lapseCount: newLapseCount,
        updatedAt: Date.now(),
      });

      return { cardId: existing._id, nextDueAt, isNew: false };
    } else {
      // Create new card
      const { nextStability, nextDifficulty, nextDueAt } = calculateNextReview(
        quality,
        0, // Initial stability
        0.3, // Initial difficulty
        0 // No lapses yet
      );

      const cardId = await ctx.db.insert("practiceReviewDeck", {
        userId,
        itemId,
        dueAt: nextDueAt,
        stability: nextStability,
        difficulty: nextDifficulty,
        lapseCount: quality < 3 ? 1 : 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return { cardId, nextDueAt, isNew: true };
    }
  },
});

// Get due review items for user
export const getDueReviews = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 10 } = args;
    const now = Date.now();

    const dueCards = await ctx.db
      .query("practiceReviewDeck")
      .withIndex("by_user_due", (q) => q.eq("userId", userId))
      .filter((q) => q.lte(q.field("dueAt"), now))
      .order("asc")
      .take(limit);

    // Fetch item details
    const cardsWithItems = await Promise.all(
      dueCards.map(async (card) => {
        const item = await ctx.db.get(card.itemId);
        return {
          cardId: card._id,
          item,
          dueAt: card.dueAt,
          stability: card.stability,
          difficulty: card.difficulty,
          lapseCount: card.lapseCount,
        };
      })
    );

    return cardsWithItems.filter(c => c.item !== null);
  },
});

// Get review statistics
export const getReviewStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allCards = await ctx.db
      .query("practiceReviewDeck")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const dueToday = allCards.filter(card => card.dueAt <= now).length;
    const dueTomorrow = allCards.filter(card => {
      const tomorrow = now + 24 * 60 * 60 * 1000;
      return card.dueAt > now && card.dueAt <= tomorrow;
    }).length;
    const dueThisWeek = allCards.filter(card => {
      const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
      return card.dueAt > now && card.dueAt <= weekFromNow;
    }).length;

    return {
      totalCards: allCards.length,
      dueToday,
      dueTomorrow,
      dueThisWeek,
      averageStability: allCards.length > 0
        ? allCards.reduce((sum, card) => sum + card.stability, 0) / allCards.length
        : 0,
    };
  },
});

// Remove item from review deck
export const removeFromReviewDeck = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.id("practiceItems"),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("practiceReviewDeck")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();

    if (card) {
      await ctx.db.delete(card._id);
      return { success: true };
    }

    return { success: false };
  },
});
