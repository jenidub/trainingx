import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ===== QUERIES =====

// Get assessment for a domain
export const getByDomain = query({
  args: { domainId: v.id("practiceDomains") },
  handler: async (ctx, args) => {
    const assessment = await ctx.db
      .query("domainAssessments")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .first();

    return assessment;
  },
});

// Get questions for an assessment
export const getQuestions = query({
  args: { assessmentId: v.id("domainAssessments") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("domainAssessmentQuestions")
      .withIndex("by_assessment", (q) =>
        q.eq("assessmentId", args.assessmentId)
      )
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    return questions.sort((a, b) => a.order - b.order);
  },
});

// Get user's attempt history for an assessment
export const getAttempts = query({
  args: {
    userId: v.id("users"),
    assessmentId: v.id("domainAssessments"),
  },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("domainAssessmentAttempts")
      .withIndex("by_user_assessment", (q) =>
        q.eq("userId", args.userId).eq("assessmentId", args.assessmentId)
      )
      .collect();

    return attempts.sort((a, b) => b.startedAt - a.startedAt);
  },
});

// Check if user can take/retake assessment
export const canTake = query({
  args: {
    userId: v.id("users"),
    assessmentId: v.id("domainAssessments"),
  },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) return { canTake: false, reason: "Assessment not found" };

    // Get user's attempts
    const attempts = await ctx.db
      .query("domainAssessmentAttempts")
      .withIndex("by_user_assessment", (q) =>
        q.eq("userId", args.userId).eq("assessmentId", args.assessmentId)
      )
      .collect();

    // Check if already passed
    const passed = attempts.some((a) => a.passed);
    if (passed) {
      return { canTake: false, reason: "Already passed", passed: true };
    }

    // Check max attempts
    if (attempts.length >= assessment.maxAttempts) {
      return { canTake: false, reason: "Max attempts reached" };
    }

    // Check cooldown
    const lastAttempt = attempts.sort((a, b) => b.startedAt - a.startedAt)[0];
    if (lastAttempt) {
      const cooldownMs = assessment.cooldownHours * 60 * 60 * 1000;
      const timeSinceLastAttempt = Date.now() - lastAttempt.startedAt;
      if (timeSinceLastAttempt < cooldownMs) {
        const hoursRemaining = Math.ceil(
          (cooldownMs - timeSinceLastAttempt) / (60 * 60 * 1000)
        );
        return {
          canTake: false,
          reason: `Cooldown active. ${hoursRemaining}h remaining`,
          cooldownEndsAt: lastAttempt.startedAt + cooldownMs,
        };
      }
    }

    return {
      canTake: true,
      attemptNumber: attempts.length + 1,
      attemptsRemaining: assessment.maxAttempts - attempts.length,
    };
  },
});

// Check if all tracks in domain are complete (prerequisite for assessment)
export const isUnlocked = query({
  args: {
    userId: v.id("users"),
    domainId: v.id("practiceDomains"),
  },
  handler: async (ctx, args) => {
    // DEV BYPASS - Remove this in production!
    const DEV_BYPASS = true;
    if (DEV_BYPASS) {
      return { isUnlocked: true };
    }

    // Get all tracks in domain
    const tracks = await ctx.db
      .query("practiceTracks")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    if (tracks.length === 0) {
      return { isUnlocked: false, reason: "No tracks in domain" };
    }

    // Check user progress for each track
    const incompleteTracksCount = await Promise.all(
      tracks.map(async (track) => {
        const progress = await ctx.db
          .query("userTrackProgress")
          .withIndex("by_user_track", (q) =>
            q.eq("userId", args.userId).eq("trackId", track._id)
          )
          .first();

        return !progress || progress.percentComplete < 100 ? 1 : 0;
      })
    );

    const incomplete = incompleteTracksCount.reduce(
      (sum: number, val) => sum + val,
      0 as number
    );

    if (incomplete > 0) {
      return {
        isUnlocked: false,
        reason: `Complete ${incomplete} more track${incomplete > 1 ? "s" : ""} to unlock`,
        tracksRemaining: incomplete,
        totalTracks: tracks.length,
      };
    }

    return { isUnlocked: true };
  },
});

// ===== MUTATIONS =====

// Start a new assessment attempt
export const startAttempt = mutation({
  args: {
    userId: v.id("users"),
    assessmentId: v.id("domainAssessments"),
  },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    // Get previous attempts
    const attempts = await ctx.db
      .query("domainAssessmentAttempts")
      .withIndex("by_user_assessment", (q) =>
        q.eq("userId", args.userId).eq("assessmentId", args.assessmentId)
      )
      .collect();

    const attemptNumber = attempts.length + 1;

    // Create attempt
    const attemptId = await ctx.db.insert("domainAssessmentAttempts", {
      userId: args.userId,
      assessmentId: args.assessmentId,
      startedAt: Date.now(),
      timeSpent: 0,
      answers: [],
      totalScore: 0,
      passed: false,
      attemptNumber,
    });

    return { attemptId, attemptNumber };
  },
});

// Submit answer for a question
export const submitAnswer = mutation({
  args: {
    attemptId: v.id("domainAssessmentAttempts"),
    questionId: v.id("domainAssessmentQuestions"),
    response: v.any(),
    score: v.number(),
    isCorrect: v.boolean(),
    aiEvaluation: v.optional(
      v.object({
        rationale: v.string(),
        rubricScores: v.any(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) throw new Error("Attempt not found");

    // Add answer to attempt
    const newAnswer = {
      questionId: args.questionId,
      response: args.response,
      score: args.score,
      isCorrect: args.isCorrect,
      aiEvaluation: args.aiEvaluation,
    };

    await ctx.db.patch(args.attemptId, {
      answers: [...attempt.answers, newAnswer],
      timeSpent: Math.round((Date.now() - attempt.startedAt) / 1000),
    });

    return { success: true };
  },
});

// Complete the assessment
export const completeAttempt = mutation({
  args: {
    attemptId: v.id("domainAssessmentAttempts"),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const assessment = await ctx.db.get(attempt.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    // Calculate total score
    const totalPoints = attempt.answers.reduce((sum, a) => sum + a.score, 0);
    const maxPoints = attempt.answers.length * 100; // Each question is worth 100
    const totalScore =
      maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const passed = totalScore >= assessment.passingScore;

    // Update attempt
    await ctx.db.patch(args.attemptId, {
      completedAt: Date.now(),
      totalScore,
      passed,
      timeSpent: Math.round((Date.now() - attempt.startedAt) / 1000),
    });

    // If passed, issue certificate
    let certificateId = null;
    if (passed) {
      const domain = await ctx.db.get(assessment.domainId);
      const verificationCode = generateVerificationCode();

      certificateId = await ctx.db.insert("domainCertificates", {
        userId: attempt.userId,
        domainId: assessment.domainId,
        assessmentAttemptId: args.attemptId,
        score: totalScore,
        issuedAt: Date.now(),
        verificationCode,
      });
    }

    return {
      totalScore,
      passed,
      certificateId,
      passingScore: assessment.passingScore,
    };
  },
});

// Helper function to generate verification code
function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars like 0/O, 1/I
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ===== ADMIN MUTATIONS =====

// Create a new assessment (admin)
export const create = mutation({
  args: {
    domainId: v.id("practiceDomains"),
    title: v.string(),
    description: v.string(),
    timeLimit: v.number(),
    passingScore: v.number(),
    questionCount: v.number(),
    maxAttempts: v.number(),
    cooldownHours: v.number(),
  },
  handler: async (ctx, args) => {
    const assessmentId = await ctx.db.insert("domainAssessments", {
      ...args,
      status: "draft",
    });

    return assessmentId;
  },
});

// Add question to assessment (admin)
export const addQuestion = mutation({
  args: {
    assessmentId: v.id("domainAssessments"),
    type: v.string(),
    order: v.number(),
    scenario: v.optional(v.string()),
    question: v.string(),
    options: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          isCorrect: v.boolean(),
        })
      )
    ),
    promptGoal: v.optional(v.string()),
    promptRubric: v.optional(
      v.object({
        criteria: v.array(
          v.object({
            name: v.string(),
            weight: v.number(),
            description: v.string(),
          })
        ),
      })
    ),
    idealAnswer: v.optional(v.string()),
    points: v.number(),
    difficulty: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("domainAssessmentQuestions", {
      ...args,
      status: "live",
    });

    return questionId;
  },
});

// Publish assessment (admin)
export const publish = mutation({
  args: { assessmentId: v.id("domainAssessments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assessmentId, { status: "live" });
    return { success: true };
  },
});
