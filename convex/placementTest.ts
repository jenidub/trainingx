import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { mapPracticeTagsToSkills } from "./skillTags";

/**
 * Placement Test System
 * 12-item adaptive test that seeds initial skill Elo values
 * and recommends appropriate track
 */

// Get or create placement test for user
export const getOrCreatePlacementTest = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Check if user already completed placement
    const existing = await ctx.db
      .query("placementTests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return { completed: true, test: existing };
    }

    // Generate 12-item adaptive test
    // For Phase 1, we'll use a balanced selection across skills
    const items = await selectPlacementItems(ctx);

    return {
      completed: false,
      items: items.map(item => ({
        itemId: item._id,
        question: item.params.question || "Question",
        type: item.params.type || "multiple-choice",
        skills: mapPracticeTagsToSkills(item.tags),
      })),
    };
  },
});

// Select 12 items for placement test
async function selectPlacementItems(ctx: any) {
  // Get all live items with foundation difficulty
  const allItems = await ctx.db
    .query("practiceItems")
    .withIndex("by_status", (q: any) => q.eq("status", "live"))
    .collect();

  // Filter for foundation items
  const foundationItems = allItems.filter(
    (item: any) => item.difficultyBand === "foundation"
  );

  // If we don't have enough items yet, return empty
  // (Phase 1 will backfill these)
  if (foundationItems.length < 12) {
    return [];
  }

  // Select 12 items balanced across skills
  const skillGroups: Record<string, any[]> = {};
  
  for (const item of foundationItems) {
    const itemSkills = mapPracticeTagsToSkills(item.tags);
    for (const skill of itemSkills) {
      if (!skillGroups[skill]) {
        skillGroups[skill] = [];
      }
      skillGroups[skill].push(item);
    }
  }

  // Take 2 items per major skill (6 skills = 12 items)
  const majorSkills = [
    "generative_ai",
    "communication",
    "analysis",
    "planning",
    "logic",
    "creativity",
  ];

  const selected: any[] = [];
  for (const skill of majorSkills) {
    const items = skillGroups[skill] || [];
    const shuffled = items.sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, 2));
  }

  return selected.slice(0, 12);
}

// Submit placement test results
export const submitPlacementTest = mutation({
  args: {
    userId: v.id("users"),
    responses: v.array(v.object({
      itemId: v.id("practiceItems"),
      response: v.any(),
      correct: v.boolean(),
      timeMs: v.number(),
    })),
  },
  handler: async (ctx, { userId, responses }) => {
    // Calculate initial skill ratings based on performance
    const skillScores: Record<string, { correct: number; total: number }> = {};

    for (const response of responses) {
      const item = await ctx.db.get(response.itemId);
      if (!item) continue;

      const itemSkills = mapPracticeTagsToSkills(item.tags);
      for (const skill of itemSkills) {
        if (!skillScores[skill]) {
          skillScores[skill] = { correct: 0, total: 0 };
        }
        skillScores[skill].total++;
        if (response.correct) {
          skillScores[skill].correct++;
        }
      }
    }

    // Convert to Elo ratings (1500 baseline, ±200 based on performance)
    const initialSkillRatings = {
      generative_ai: 1500,
      agentic_ai: 1500,
      synthetic_ai: 1500,
      communication: 1500,
      logic: 1500,
      planning: 1500,
      analysis: 1500,
      creativity: 1500,
      collaboration: 1500,
    };

    for (const [skill, scores] of Object.entries(skillScores)) {
      if (skill in initialSkillRatings) {
        const accuracy = scores.correct / scores.total;
        // Map 0-100% accuracy to 1300-1700 Elo
        (initialSkillRatings as any)[skill] = Math.round(1300 + (accuracy * 400));
      }
    }

    // Determine recommended track based on strongest skills
    const recommendedTrack = determineRecommendedTrack(initialSkillRatings);

    // Save placement test results
    const testId = await ctx.db.insert("placementTests", {
      userId,
      items: responses,
      initialSkillRatings,
      recommendedTrack,
      completedAt: Date.now(),
    });

    // Initialize user skill ratings using the new system
    const practiceUserSkills = await import("./practiceUserSkills");
    await practiceUserSkills.initializeSkillsFromPlacement(
      ctx,
      userId,
      initialSkillRatings
    );

    // Update user stats to mark assessment complete
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userStats) {
      await ctx.db.patch(userStats._id, {
        assessmentComplete: true,
      });
    }

    return {
      testId,
      initialSkillRatings,
      recommendedTrack,
    };
  },
});

// Determine recommended track based on skill profile
function determineRecommendedTrack(skills: Record<string, number>): string {
  const avgGenerative = skills.generative_ai;
  const avgAnalytics = (skills.analysis + skills.logic) / 2;
  const avgOps = (skills.planning + skills.collaboration) / 2;
  const avgStrategy = (skills.planning + skills.analysis + skills.communication) / 3;

  const scores = {
    content: avgGenerative + skills.creativity + skills.communication,
    analytics: avgAnalytics + skills.synthetic_ai,
    ops: avgOps + skills.agentic_ai,
    strategy: avgStrategy + skills.planning,
  };

  // Return track with highest score
  return Object.entries(scores).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0];
}

// Get user's placement test results
export const getUserPlacementTest = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("placementTests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});
