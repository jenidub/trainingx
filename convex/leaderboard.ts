import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

const MAX_LIMIT = 200;

type SortBy = "promptScore" | "totalScore" | "communityScore";
type LeaderboardIndex = "by_promptScore" | "by_totalScore" | "by_communityScore";

// Get leaderboard with sorting options
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("promptScore"),
        v.literal("totalScore"),
        v.literal("communityScore")
      )
    ),
  },
  handler: async (ctx, { limit = 50, sortBy = "totalScore" }) => {
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const indexName = getIndexName(sortBy);
    const stats = await ctx.db
      .query("userStats")
      .withIndex(indexName)
      .order("desc")
      .take(safeLimit * 2);

    const leaderboardData = await Promise.all(
      stats.slice(0, safeLimit).map(async (record, index) => {
        const user = await ctx.db.get(record.userId);
        const communityScore =
          record.communityScore ??
          record.communityActivity?.communityScore ??
          0;
        const totalScore = record.totalScore ?? record.promptScore + communityScore;

        return {
          userId: record.userId,
          userName: user?.name || "Anonymous",
          userImage: user?.image,
          promptScore: record.promptScore,
          communityScore,
          totalScore,
          streak: record.streak,
          badges: (record.badges || []).length,
          upvotes: record.communityActivity.upvotesReceived,
          assessmentComplete: record.assessmentComplete,
          rank: index + 1,
        };
      })
    );

    return leaderboardData;
  },
});

// Get user's rank on leaderboard
export const getUserRank = query({
  args: {
    userId: v.id("users"),
    sortBy: v.optional(
      v.union(
        v.literal("promptScore"),
        v.literal("totalScore"),
        v.literal("communityScore")
      )
    ),
  },
  handler: async (ctx, { userId, sortBy = "totalScore" }) => {
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userStats) {
      return null;
    }

    const comparisonScore = getScoreForSort(userStats, sortBy);
    const indexName = getIndexName(sortBy);
    const higherScores = await ctx.db
      .query("userStats")
      .withIndex(indexName, (q) =>
        q.gt(getFieldName(sortBy), comparisonScore)
      )
      .collect();

    return {
      rank: higherScores.length + 1,
      totalScore: getScoreForSort(userStats, "totalScore"),
    };
  },
});

function getIndexName(sortBy: SortBy): LeaderboardIndex {
  if (sortBy === "promptScore") return "by_promptScore";
  if (sortBy === "communityScore") return "by_communityScore";
  return "by_totalScore";
}

function getFieldName(sortBy: SortBy) {
  if (sortBy === "promptScore") {
    return "promptScore";
  }
  if (sortBy === "communityScore") {
    return "communityScore";
  }
  return "totalScore";
}

function getScoreForSort(
  stats: Doc<"userStats">,
  sortBy: SortBy
) {
  if (sortBy === "promptScore") {
    return stats.promptScore ?? 0;
  }
  if (sortBy === "communityScore") {
    return stats.communityScore ??
      stats.communityActivity?.communityScore ??
      0;
  }
  const communityScore =
    stats.communityScore ??
    stats.communityActivity?.communityScore ??
    0;
  return stats.totalScore ?? stats.promptScore + communityScore;
}
