import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { nextLeaderboardFields } from "./userStatsUtils";

const badgeTiers = [
  { count: 1, badge: "Insight Contributor" },
  { count: 5, badge: "Signal Booster" },
  { count: 10, badge: "Product Co-Pilot" },
];

export const submitFeedback = mutation({
  args: {
    sentiment: v.string(),
    score: v.optional(v.number()),
    tags: v.array(v.string()),
    message: v.optional(v.string()),
    contactOk: v.boolean(),
    contactEmail: v.optional(v.string()),
    page: v.optional(v.string()),
    feature: v.optional(v.string()),
    env: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        viewport: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const createdAt = Date.now();
    const cleanedMessage = args.message?.trim() || "";
    const baseReward = 50;
    const tagBonus = Math.min(args.tags.length * 5, 15);
    const noteBonus = cleanedMessage ? 20 : 0;
    const scoreBonus = args.score && args.score >= 8 ? 10 : 0;
    const rewardXp = Math.min(120, baseReward + tagBonus + noteBonus + scoreBonus);

    // Count total feedback for badge tiers (including this one)
    const existingFeedback = await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const feedbackCount = existingFeedback.length + 1;

    let badgeAwarded: string | undefined;
    const upcomingTier = badgeTiers.find((tier) => feedbackCount < tier.count);

    // Update user stats with reward and badge progress
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let updatedBadges: string[] | undefined;

    if (userStats) {
      const existingBadges = userStats.badges || [];
      for (const tier of badgeTiers) {
        if (feedbackCount >= tier.count && !existingBadges.includes(tier.badge)) {
          badgeAwarded = tier.badge;
        }
      }

      if (badgeAwarded) {
        updatedBadges = [...new Set([...existingBadges, badgeAwarded])];
      }

      const communityActivity = {
        ...userStats.communityActivity,
        communityScore:
          (userStats.communityActivity?.communityScore ?? 0) + rewardXp,
      };

      await ctx.db.patch(userStats._id, {
        communityActivity,
        badges: updatedBadges ?? userStats.badges,
        ...nextLeaderboardFields(userStats, {
          communityActivity,
          communityScore: communityActivity.communityScore,
        }),
      });
    }

    const feedbackId = await ctx.db.insert("feedback", {
      ...args,
      userId,
      message: cleanedMessage || undefined,
      reward: { xp: rewardXp, badgeAwarded },
      status: "new",
      createdAt,
    });

    return {
      feedbackId,
      reward: { xp: rewardXp, badgeAwarded },
      badgeProgress: {
        nextTier: upcomingTier,
        totalSubmitted: feedbackCount,
      },
    };
  },
});

export const getMyFeedback = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 5 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return items
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});
