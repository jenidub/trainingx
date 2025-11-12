import { v } from "convex/values";
import { query } from "./_generated/server";

// Get Elo convergence metrics
export const getEloConvergence = query({
  args: {
    itemId: v.optional(v.id("practiceItems")),
    templateId: v.optional(v.id("practiceItemTemplates")),
  },
  handler: async (ctx, args) => {
    let items;

    if (args.itemId) {
      const item = await ctx.db.get(args.itemId);
      items = item ? [item] : [];
    } else if (args.templateId) {
      items = await ctx.db
        .query("practiceItems")
        .withIndex("by_template", (q) => q.eq("templateId", args.templateId!))
        .collect();
    } else {
      items = await ctx.db
        .query("practiceItems")
        .withIndex("by_status", (q) => q.eq("status", "live"))
        .take(100);
    }

    const convergenceData = items.map(item => ({
      itemId: item._id,
      elo: item.elo,
      deviation: item.eloDeviation,
      isConverged: item.eloDeviation < 100,
      difficultyBand: item.difficultyBand,
    }));

    const convergedCount = convergenceData.filter(d => d.isConverged).length;
    const convergenceRate = items.length > 0 ? convergedCount / items.length : 0;

    return {
      items: convergenceData,
      totalItems: items.length,
      convergedItems: convergedCount,
      convergenceRate: Math.round(convergenceRate * 100),
      averageDeviation: items.length > 0
        ? items.reduce((sum, item) => sum + item.eloDeviation, 0) / items.length
        : 0,
    };
  },
});

// Get completion time analytics
export const getCompletionTimeStats = query({
  args: {
    userId: v.optional(v.id("users")),
    itemId: v.optional(v.id("practiceItems")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, itemId, days = 7 } = args;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let attempts;

    if (userId) {
      attempts = await ctx.db
        .query("practiceAttempts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
        .collect();
    } else if (itemId) {
      attempts = await ctx.db
        .query("practiceAttempts")
        .withIndex("by_item", (q) => q.eq("itemId", itemId))
        .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
        .collect();
    } else {
      attempts = await ctx.db
        .query("practiceAttempts")
        .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
        .collect();
    }

    if (attempts.length === 0) {
      return {
        count: 0,
        averageTimeMs: 0,
        medianTimeMs: 0,
        minTimeMs: 0,
        maxTimeMs: 0,
      };
    }

    const times = attempts.map(a => a.timeMs).sort((a, b) => a - b);
    const sum = times.reduce((acc, t) => acc + t, 0);
    const median = times[Math.floor(times.length / 2)];

    return {
      count: attempts.length,
      averageTimeMs: Math.round(sum / times.length),
      medianTimeMs: median,
      minTimeMs: times[0],
      maxTimeMs: times[times.length - 1],
    };
  },
});

// Get drop-off analytics
export const getDropOffAnalytics = query({
  args: {
    projectId: v.optional(v.id("practiceProjects")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { projectId, days = 30 } = args;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let attempts;

    if (projectId) {
      attempts = await ctx.db
        .query("practiceAttempts")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .filter((q) => q.gte(q.field("startedAt"), cutoffTime))
        .collect();
    } else {
      attempts = await ctx.db
        .query("practiceAttempts")
        .filter((q) => q.gte(q.field("startedAt"), cutoffTime))
        .collect();
    }

    const completed = attempts.filter(a => a.completedAt > 0);
    const abandoned = attempts.filter(a => a.completedAt === 0 || a.timeMs === 0);

    const completionRate = attempts.length > 0
      ? completed.length / attempts.length
      : 0;

    return {
      totalAttempts: attempts.length,
      completed: completed.length,
      abandoned: abandoned.length,
      completionRate: Math.round(completionRate * 100),
    };
  },
});

// Get difficulty band conversion rates
export const getDifficultyBandConversion = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, days = 30 } = args;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const attempts = await ctx.db
      .query("practiceAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
      .collect();

    const byBand: Record<string, { total: number; correct: number }> = {
      foundation: { total: 0, correct: 0 },
      core: { total: 0, correct: 0 },
      challenge: { total: 0, correct: 0 },
    };

    for (const attempt of attempts) {
      const band = attempt.metadata?.difficultyBand || "core";
      if (byBand[band]) {
        byBand[band].total++;
        if (attempt.correct) {
          byBand[band].correct++;
        }
      }
    }

    return Object.entries(byBand).map(([band, stats]) => ({
      band,
      total: stats.total,
      correct: stats.correct,
      successRate: stats.total > 0
        ? Math.round((stats.correct / stats.total) * 100)
        : 0,
    }));
  },
});

// Get adaptive picker effectiveness
export const getAdaptivePickerStats = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, days = 7 } = args;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const attempts = await ctx.db
      .query("practiceAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
      .collect();

    const adaptiveSessions = attempts.filter(
      a => a.metadata?.mode === "adaptive"
    );

    const totalSessions = attempts.length;
    const adaptiveRate = totalSessions > 0
      ? adaptiveSessions.length / totalSessions
      : 0;

    const avgScore = adaptiveSessions.length > 0
      ? adaptiveSessions.reduce((sum, a) => sum + a.score, 0) / adaptiveSessions.length
      : 0;

    return {
      totalSessions,
      adaptiveSessions: adaptiveSessions.length,
      adaptiveRate: Math.round(adaptiveRate * 100),
      averageScore: Math.round(avgScore),
    };
  },
});

// Get AI evaluation cost tracking
export const getAIEvaluationCosts = query({
  args: {
    days: v.optional(v.number()),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { days = 30, provider } = args;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let query = ctx.db
      .query("aiEvaluationLogs")
      .withIndex("by_date", (q) => q.gte("createdAt", cutoffTime));

    const logs = await query.collect();

    const filtered = provider
      ? logs.filter(log => log.provider === provider)
      : logs;

    const totalCost = filtered.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = filtered.reduce((sum, log) => sum + log.totalTokens, 0);
    const avgLatency = filtered.length > 0
      ? filtered.reduce((sum, log) => sum + log.latencyMs, 0) / filtered.length
      : 0;
    const successRate = filtered.length > 0
      ? filtered.filter(log => log.success).length / filtered.length
      : 0;

    return {
      totalEvaluations: filtered.length,
      totalCost: Math.round(totalCost * 100) / 100,
      totalTokens,
      averageLatencyMs: Math.round(avgLatency),
      successRate: Math.round(successRate * 100),
      costPerEvaluation: filtered.length > 0
        ? Math.round((totalCost / filtered.length) * 1000) / 1000
        : 0,
    };
  },
});
