import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * User Skill Ratings (Elo-based)
 * Single source of truth for all skill tracking
 */

// Get all user skills
export const getUserSkills = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const skills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return skills;
  },
});

// Get user skills as display scores (0-100)
export const getUserSkillsDisplay = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const skills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Convert Elo (1300-1700) to 0-100 scale
    const displaySkills: Record<string, number> = {};
    for (const skill of skills) {
      displaySkills[skill.skillId] = eloToDisplay(skill.rating);
    }

    return displaySkills;
  },
});

// Helper function to update skill rating (can be called from other mutations)
async function updateSkillRatingInternal(
  ctx: any,
  userId: Id<"users">,
  skillId: string,
  itemDifficulty: number,
  correct: boolean
) {
  // Get current skill rating
  let skill = await ctx.db
    .query("practiceUserSkills")
    .withIndex("by_user_skill", (q: any) => 
      q.eq("userId", userId).eq("skillId", skillId)
    )
    .first();

  // Initialize if doesn't exist
  if (!skill) {
    const skillId_new = await ctx.db.insert("practiceUserSkills", {
      userId,
      skillId,
      rating: 1500,
      deviation: 350,
      lastUpdated: Date.now(),
    });
    skill = await ctx.db.get(skillId_new);
    if (!skill) throw new Error("Failed to create skill");
  }

  // Calculate new rating using Elo
  const newRating = calculateEloUpdate(
    skill.rating,
    itemDifficulty,
    correct,
    skill.deviation
  );

  // Reduce deviation over time (uncertainty decreases with practice)
  const newDeviation = Math.max(50, skill.deviation * 0.95);

  await ctx.db.patch(skill._id, {
    rating: newRating,
    deviation: newDeviation,
    lastUpdated: Date.now(),
  });

  return { oldRating: skill.rating, newRating, skillId };
}

// Export for use in other mutations
export { updateSkillRatingInternal as updateSkillRating };

// Public mutation for direct calls
export const updateSkillRatingMutation = mutation({
  args: {
    userId: v.id("users"),
    skillId: v.string(),
    itemDifficulty: v.number(),
    correct: v.boolean(),
  },
  handler: async (ctx, { userId, skillId, itemDifficulty, correct }) => {
    return await updateSkillRatingInternal(ctx, userId, skillId, itemDifficulty, correct);
  },
});

// Batch update multiple skills
export const updateMultipleSkills = mutation({
  args: {
    userId: v.id("users"),
    updates: v.array(v.object({
      skillId: v.string(),
      itemDifficulty: v.number(),
      correct: v.boolean(),
    })),
  },
  handler: async (ctx, { userId, updates }) => {
    const results = [];
    
    for (const update of updates) {
      const result = await updateSkillRatingInternal(
        ctx,
        userId,
        update.skillId,
        update.itemDifficulty,
        update.correct
      );
      results.push(result);
    }

    return results;
  },
});

// Helper function to initialize skills (can be called from other mutations)
async function initializeSkillsFromPlacementInternal(
  ctx: any,
  userId: Id<"users">,
  skillRatings: Record<string, number>
) {
  // Check if skills already exist
  const existing = await ctx.db
    .query("practiceUserSkills")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  if (existing.length > 0) {
    // Update existing skills
    for (const [skillId, rating] of Object.entries(skillRatings)) {
      const skill = existing.find((s: any) => s.skillId === skillId);
      if (skill) {
        await ctx.db.patch(skill._id, {
          rating,
          deviation: 350,
          lastUpdated: Date.now(),
        });
      } else {
        await ctx.db.insert("practiceUserSkills", {
          userId,
          skillId,
          rating,
          deviation: 350,
          lastUpdated: Date.now(),
        });
      }
    }
  } else {
    // Create new skills
    for (const [skillId, rating] of Object.entries(skillRatings)) {
      await ctx.db.insert("practiceUserSkills", {
        userId,
        skillId,
        rating,
        deviation: 350,
        lastUpdated: Date.now(),
      });
    }
  }

  // Also update userStats for backward compatibility
  const userStats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (userStats) {
    const displaySkills: any = {};
    for (const [skillId, rating] of Object.entries(skillRatings)) {
      displaySkills[skillId] = eloToDisplay(rating);
    }

    await ctx.db.patch(userStats._id, {
      skills: displaySkills,
    });
  }

  return { success: true };
}

// Export for use in other mutations
export { initializeSkillsFromPlacementInternal as initializeSkillsFromPlacement };

// Public mutation for direct calls
export const initializeSkillsFromPlacementMutation = mutation({
  args: {
    userId: v.id("users"),
    skillRatings: v.object({
      generative_ai: v.number(),
      agentic_ai: v.number(),
      synthetic_ai: v.number(),
      communication: v.number(),
      logic: v.number(),
      planning: v.number(),
      analysis: v.number(),
      creativity: v.number(),
      collaboration: v.number(),
    }),
  },
  handler: async (ctx, { userId, skillRatings }) => {
    return await initializeSkillsFromPlacementInternal(ctx, userId, skillRatings);
  },
});

// Helper: Calculate Elo update
function calculateEloUpdate(
  userRating: number,
  itemDifficulty: number,
  correct: boolean,
  deviation: number
): number {
  // Expected score based on rating difference
  const expected = 1 / (1 + Math.pow(10, (itemDifficulty - userRating) / 400));
  
  // K-factor: higher for uncertain ratings (high deviation)
  const kFactor = Math.min(40, 16 + (deviation / 10));
  
  // Actual score: 1 for correct, 0 for incorrect
  const actual = correct ? 1 : 0;
  
  // New rating
  const newRating = userRating + kFactor * (actual - expected);
  
  // Clamp to reasonable range
  return Math.max(1200, Math.min(1800, Math.round(newRating)));
}

// Helper: Convert Elo to 0-100 display score
function eloToDisplay(elo: number): number {
  // Map 1300-1700 to 0-100
  // 1300 = 0, 1500 = 50, 1700 = 100
  const normalized = ((elo - 1300) / 400) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

// Helper: Convert 0-100 display score to Elo
export function displayToElo(display: number): number {
  // Map 0-100 to 1300-1700
  return Math.round(1300 + (display / 100) * 400);
}
