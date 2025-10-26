import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAssessments = query({
  args: {
    category: v.optional(v.string()),
    type: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let assessments = ctx.db.query("assessments");

    // Collect all results first, then apply filters
    const results = await assessments.collect();

    // Filter by category and type after collecting
    let filtered = results;
    if (args.category) {
      filtered = filtered.filter(a => a.category === args.category);
    }
    if (args.type) {
      filtered = filtered.filter(a => a.type === args.type);
    }

    // Apply additional filters
    if (args.difficulty) {
      filtered = filtered.filter(a => a.difficulty === args.difficulty);
    }
    if (args.isActive !== undefined) {
      filtered = filtered.filter(a => a.isActive === args.isActive);
    }
    if (args.limit && args.limit > 0) {
      filtered = filtered.slice(0, args.limit);
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getAssessment = query({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, { assessmentId }) => {
    const assessment = await ctx.db.get(assessmentId);
    return assessment;
  },
});

export const createAssessment = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    category: v.string(),
    difficulty: v.string(),
    timeLimit: v.optional(v.number()),
    passingScore: v.number(),
    questions: v.array(v.object({
      id: v.string(),
      question: v.string(),
      type: v.string(),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.union(v.string(), v.number(), v.array(v.string())),
      explanation: v.optional(v.string()),
      points: v.number()
    })),
    tags: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const assessmentId = await ctx.db.insert("assessments", args);
    return assessmentId;
  },
});

export const updateAssessment = mutation({
  args: {
    assessmentId: v.id("assessments"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    timeLimit: v.optional(v.number()),
    passingScore: v.optional(v.number()),
    questions: v.optional(v.array(v.object({
      id: v.string(),
      question: v.string(),
      type: v.string(),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.union(v.string(), v.number(), v.array(v.string())),
      explanation: v.optional(v.string()),
      points: v.number()
    }))),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { assessmentId, ...updates }) => {
    const assessment = await ctx.db.get(assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(assessmentId, filteredUpdates);
    return assessmentId;
  },
});

export const deleteAssessment = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, { assessmentId }) => {
    const assessment = await ctx.db.get(assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Also delete all attempts for this assessment
    const attempts = await ctx.db
      .query("assessmentAttempts")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", assessmentId))
      .collect();

    for (const attempt of attempts) {
      await ctx.db.delete(attempt._id);
    }

    await ctx.db.delete(assessmentId);
    return true;
  },
});

// Assessment Attempts
export const startAssessmentAttempt = mutation({
  args: {
    userId: v.id("users"),
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, { userId, assessmentId }) => {
    const assessment = await ctx.db.get(assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const attemptId = await ctx.db.insert("assessmentAttempts", {
      userId,
      assessmentId,
      answers: [],
      score: 0,
      totalPoints: assessment.questions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      passed: false,
      startedAt: Date.now(),
      timeSpent: 0,
    });

    return attemptId;
  },
});

export const submitAnswer = mutation({
  args: {
    attemptId: v.id("assessmentAttempts"),
    questionId: v.string(),
    answer: v.any(),
  },
  handler: async (ctx, { attemptId, questionId, answer }) => {
    const attempt = await ctx.db.get(attemptId);
    if (!attempt) {
      throw new Error("Assessment attempt not found");
    }

    const assessment = await ctx.db.get(attempt.assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const question = assessment.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    // Check if answer is correct
    let isCorrect = false;
    if (Array.isArray(question.correctAnswer)) {
      isCorrect = Array.isArray(answer) &&
        question.correctAnswer.length === answer.length &&
        question.correctAnswer.every((val, index) => val === answer[index]);
    } else {
      isCorrect = question.correctAnswer === answer;
    }

    // Remove existing answer for this question if it exists
    const updatedAnswers = attempt.answers.filter(a => a.questionId !== questionId);

    // Add new answer
    updatedAnswers.push({
      questionId,
      answer,
      isCorrect,
      points: isCorrect ? question.points : 0
    });

    // Calculate new score
    const newScore = updatedAnswers.reduce((sum, a) => sum + a.points, 0);
    const newPercentage = (newScore / attempt.totalPoints) * 100;

    await ctx.db.patch(attemptId, {
      answers: updatedAnswers,
      score: newScore,
      percentage: Math.round(newPercentage * 100) / 100, // Round to 2 decimal places
    });

    return {
      isCorrect,
      points: isCorrect ? question.points : 0,
      explanation: question.explanation,
      currentScore: newScore,
      currentPercentage: newPercentage,
    };
  },
});

export const completeAssessmentAttempt = mutation({
  args: {
    attemptId: v.id("assessmentAttempts"),
  },
  handler: async (ctx, { attemptId }) => {
    const attempt = await ctx.db.get(attemptId);
    if (!attempt) {
      throw new Error("Assessment attempt not found");
    }

    const assessment = await ctx.db.get(attempt.assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const completedAt = Date.now();
    const timeSpent = Math.round((completedAt - attempt.startedAt) / (1000 * 60)); // in minutes

    const passed = attempt.percentage >= assessment.passingScore;

    // Generate feedback based on performance
    let feedback = "";
    if (attempt.percentage >= 90) {
      feedback = "Excellent work! You've mastered this material.";
    } else if (attempt.percentage >= 80) {
      feedback = "Great job! You have a solid understanding of this topic.";
    } else if (attempt.percentage >= 70) {
      feedback = "Good work! Consider reviewing the areas where you lost points.";
    } else if (attempt.percentage >= 60) {
      feedback = "You're making progress! Focus on strengthening your weaker areas.";
    } else {
      feedback = "Keep practicing! Review the material and try again.";
    }

    await ctx.db.patch(attemptId, {
      completedAt: completedAt!,
      timeSpent,
      passed,
      feedback,
    });

    // Create or update user progress record
    const allProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", attempt.userId))
      .collect();

    const existingProgress = allProgress.find(p => p.assessmentId === attempt.assessmentId);

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        status: "completed",
        progress: 100,
        score: attempt.percentage,
        completedAt,
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId: attempt.userId,
        assessmentId: attempt.assessmentId,
        status: "completed",
        progress: 100,
        score: attempt.percentage,
        startedAt: attempt.startedAt,
        lastAccessedAt: completedAt,
        completedAt,
        timeSpent,
      });
    }

    return {
      passed,
      score: attempt.percentage,
      timeSpent,
      feedback,
    };
  },
});

export const getUserAssessmentAttempts = query({
  args: {
    userId: v.id("users"),
    assessmentId: v.optional(v.id("assessments")),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { userId, assessmentId, limit }) => {
    const allAttempts = await ctx.db
      .query("assessmentAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by assessmentId if provided
    let results = assessmentId
      ? allAttempts.filter(a => a.assessmentId === assessmentId)
      : allAttempts;

    // Sort by start time (most recent first)
    let sorted = results.sort((a, b) => b.startedAt - a.startedAt);

    if (limit && limit > 0) {
      sorted = sorted.slice(0, limit);
    }

    return sorted;
  },
});

export const getAssessmentStats = query({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, { assessmentId }) => {
    const attempts = await ctx.db
      .query("assessmentAttempts")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", assessmentId))
      .collect();

    const completedAttempts = attempts.filter(a => a.completedAt);

    if (completedAttempts.length === 0) {
      return {
        totalAttempts: attempts.length,
        completedAttempts: 0,
        passRate: 0,
        averageScore: 0,
        averageTimeSpent: 0,
      };
    }

    const passedAttempts = completedAttempts.filter(a => a.passed);
    const averageScore = completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length;
    const averageTimeSpent = completedAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / completedAttempts.length;

    return {
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      passRate: (passedAttempts.length / completedAttempts.length) * 100,
      averageScore: Math.round(averageScore * 100) / 100,
      averageTimeSpent: Math.round(averageTimeSpent),
    };
  },
});