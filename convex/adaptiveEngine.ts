import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Elo rating constants
const K_FACTOR = 32; // Standard K-factor for Elo
const INITIAL_ELO = 1500;
const INITIAL_DEVIATION = 350;
const TARGET_OFFSET = 100; // Target items +100 Elo above user skill

// Calculate expected score for Elo rating
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Update Elo rating based on performance
function updateElo(
  currentRating: number,
  opponentRating: number,
  actualScore: number, // 1 for correct, 0 for incorrect
  kFactor: number = K_FACTOR
): number {
  const expected = expectedScore(currentRating, opponentRating);
  return currentRating + kFactor * (actualScore - expected);
}

// Determine difficulty band based on Elo
function getDifficultyBand(elo: number): "foundation" | "core" | "challenge" {
  if (elo < 1400) return "foundation";
  if (elo < 1600) return "core";
  return "challenge";
}

// Update user skill rating after attempt
export const updateSkillRating = mutation({
  args: {
    userId: v.id("users"),
    skillId: v.string(),
    itemElo: v.number(),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, skillId, itemElo, correct } = args;

    // Get or create user skill rating
    const existing = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user_skill", (q) => 
        q.eq("userId", userId).eq("skillId", skillId)
      )
      .first();

    const currentRating = existing?.rating ?? INITIAL_ELO;
    const currentDeviation = existing?.deviation ?? INITIAL_DEVIATION;

    // Calculate new rating
    const actualScore = correct ? 1 : 0;
    const newRating = updateElo(currentRating, itemElo, actualScore);
    
    // Reduce deviation as we get more data
    const newDeviation = Math.max(50, currentDeviation * 0.95);

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: newRating,
        deviation: newDeviation,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("practiceUserSkills", {
        userId,
        skillId,
        rating: newRating,
        deviation: newDeviation,
        lastUpdated: Date.now(),
      });
    }

    return { oldRating: currentRating, newRating, skillId };
  },
});

// Update item Elo after attempt
export const updateItemElo = mutation({
  args: {
    itemId: v.id("practiceItems"),
    userRating: v.number(),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { itemId, userRating, correct } = args;

    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    // Inverse scoring: item "wins" if user got it wrong
    const itemScore = correct ? 0 : 1;
    const newElo = updateElo(item.elo, userRating, itemScore, K_FACTOR / 2);
    
    // Update deviation
    const newDeviation = Math.max(50, item.eloDeviation * 0.98);
    const newBand = getDifficultyBand(newElo);

    await ctx.db.patch(itemId, {
      elo: newElo,
      eloDeviation: newDeviation,
      difficultyBand: newBand,
    });

    return { oldElo: item.elo, newElo, difficultyBand: newBand };
  },
});

// Get user's weakest skill
export const getWeakestSkill = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (skills.length === 0) return null;

    // Find skill with lowest rating
    const weakest = skills.reduce((min, skill) => 
      skill.rating < min.rating ? skill : min
    );

    return {
      skillId: weakest.skillId,
      rating: weakest.rating,
      deviation: weakest.deviation,
    };
  },
});

// Adaptive item picker - selects next best item for user
export const pickNextItem = query({
  args: {
    userId: v.id("users"),
    excludeItemIds: v.optional(v.array(v.id("practiceItems"))),
    skillFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, excludeItemIds = [], skillFilter } = args;

    // Get user's skill ratings
    const userSkills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Determine target skill (weakest or specified)
    let targetSkill = skillFilter;
    if (!targetSkill && userSkills.length > 0) {
      const weakest = userSkills.reduce((min, skill) => 
        skill.rating < min.rating ? skill : min
      );
      targetSkill = weakest.skillId;
    }

    if (!targetSkill) {
      // No skill data yet, return random foundation item
      const items = await ctx.db
        .query("practiceItems")
        .withIndex("by_difficulty", (q) => q.eq("difficultyBand", "foundation"))
        .filter((q) => q.eq(q.field("status"), "live"))
        .take(10);
      
      const available = items.filter(item => !excludeItemIds.includes(item._id));
      return available[Math.floor(Math.random() * available.length)] ?? null;
    }

    // Get user's rating for target skill
    const userSkill = userSkills.find(s => s.skillId === targetSkill);
    const userRating = userSkill?.rating ?? INITIAL_ELO;
    const targetElo = userRating + TARGET_OFFSET;

    // Find items that match target skill and are close to target Elo
    const allItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    // Filter and score items
    const scoredItems = allItems
      .filter(item => !excludeItemIds.includes(item._id))
      .filter(item => item.tags.includes(targetSkill))
      .map(item => ({
        item,
        eloDiff: Math.abs(item.elo - targetElo),
      }))
      .sort((a, b) => a.eloDiff - b.eloDiff);

    return scoredItems[0]?.item ?? null;
  },
});

// Get user's skill ratings summary
export const getUserSkillRatings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return skills.map(skill => ({
      skillId: skill.skillId,
      rating: skill.rating,
      deviation: skill.deviation,
      band: getDifficultyBand(skill.rating),
      lastUpdated: skill.lastUpdated,
    }));
  },
});
