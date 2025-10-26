import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Save quiz results
export const saveQuizResults = mutation({
  args: {
    userId: v.id("users"),
    quizType: v.string(),
    answers: v.any(),
    results: v.any(),
  },
  handler: async (ctx, args) => {
    const quizResultId = await ctx.db.insert("quizResults", {
      ...args,
      completedAt: Date.now(),
    });

    return quizResultId;
  },
});

// Get quiz results for a user
export const getQuizResults = query({
  args: {
    userId: v.id("users"),
    quizType: v.optional(v.string()),
  },
  handler: async (ctx, { userId, quizType }) => {
    let resultsQuery = ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    const results = await resultsQuery.collect();

    // Filter by quiz type if provided
    if (quizType) {
      return results.filter((r) => r.quizType === quizType);
    }

    return results;
  },
});

// Get latest quiz result for a specific type
export const getLatestQuizResult = query({
  args: {
    userId: v.id("users"),
    quizType: v.string(),
  },
  handler: async (ctx, { userId, quizType }) => {
    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", userId).eq("quizType", quizType)
      )
      .order("desc")
      .first();

    return results;
  },
});

// Get quiz history for a user
export const getQuizHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 10 }) => {
    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return results;
  },
});
