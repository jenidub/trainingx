import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new quest
export const createQuest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    requirements: v.array(v.object({
      type: v.string(),
      target: v.any(),
      progress: v.number(),
      goal: v.number(),
    })),
    rewards: v.object({
      xp: v.number(),
      badges: v.array(v.string()),
      unlocks: v.optional(v.array(v.string())),
    }),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin role check

    const questId = await ctx.db.insert("practiceQuests", {
      ...args,
      status: "active",
      participantCount: 0,
      completionCount: 0,
    });

    return questId;
  },
});

// Get active quests
export const getActiveQuests = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();

    let quests = await ctx.db
      .query("practiceQuests")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter by date range
    quests = quests.filter(q => q.startDate <= now && q.endDate >= now);

    if (args.type) {
      quests = quests.filter(q => q.type === args.type);
    }

    return quests;
  },
});

// Start a quest
export const startQuest = mutation({
  args: { 
    userId: v.id("users"),
    questId: v.id("practiceQuests") 
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const quest = await ctx.db.get(args.questId);
    if (!quest) throw new Error("Quest not found");

    // Check if already started
    const existing = await ctx.db
      .query("practiceUserQuests")
      .withIndex("by_user_quest", (q) =>
        q.eq("userId", userId).eq("questId", args.questId)
      )
      .first();

    if (existing) {
      return { userQuestId: existing._id, alreadyStarted: true };
    }

    // Initialize progress
    const progress = quest.requirements.map((req, index) => ({
      requirementIndex: index,
      current: 0,
      goal: req.goal,
      completed: false,
    }));

    const userQuestId = await ctx.db.insert("practiceUserQuests", {
      userId: userId,
      questId: args.questId,
      progress,
      status: "in_progress",
      startedAt: Date.now(),
    });

    // Increment participant count
    await ctx.db.patch(args.questId, {
      participantCount: quest.participantCount + 1,
    });

    return { userQuestId, alreadyStarted: false };
  },
});

// Update quest progress
export const updateQuestProgress = mutation({
  args: {
    userId: v.id("users"),
    eventType: v.string(),
    eventData: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId, eventType, eventData } = args;

    // Get user's active quests
    const userQuests = await ctx.db
      .query("practiceUserQuests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();

    for (const userQuest of userQuests) {
      const quest = await ctx.db.get(userQuest.questId);
      if (!quest) continue;

      let updated = false;
      const newProgress = [...userQuest.progress];

      // Check each requirement
      for (let i = 0; i < quest.requirements.length; i++) {
        const req = quest.requirements[i];
        const prog = newProgress[i];

        if (prog.completed) continue;

        // Match event to requirement
        let increment = 0;

        switch (req.type) {
          case "complete_items":
            if (eventType === "item_completed") {
              increment = 1;
            }
            break;

          case "win_duels":
            if (eventType === "duel_won") {
              increment = 1;
            }
            break;

          case "earn_score":
            if (eventType === "score_earned") {
              increment = eventData.score || 0;
            }
            break;

          case "practice_skill":
            if (eventType === "skill_practiced" && eventData.skill === req.target) {
              increment = 1;
            }
            break;

          case "daily_streak":
            if (eventType === "daily_practice") {
              increment = 1;
            }
            break;
        }

        if (increment > 0) {
          prog.current = Math.min(prog.current + increment, prog.goal);
          prog.completed = prog.current >= prog.goal;
          updated = true;
        }
      }

      if (updated) {
        // Check if all requirements completed
        const allCompleted = newProgress.every(p => p.completed);

        await ctx.db.patch(userQuest._id, {
          progress: newProgress,
          ...(allCompleted && {
            status: "completed",
            completedAt: Date.now(),
          }),
        });

        // Update quest completion count
        if (allCompleted) {
          await ctx.db.patch(userQuest.questId, {
            completionCount: quest.completionCount + 1,
          });
        }
      }
    }

    return { success: true };
  },
});

// Get user's quests
export const getUserQuests = query({
  args: { 
    userId: v.id("users"),
    status: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("practiceUserQuests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    const userQuests = await query.collect();

    let filtered = userQuests;
    if (args.status) {
      filtered = userQuests.filter(uq => uq.status === args.status);
    }

    // Fetch quest details
    const withDetails = await Promise.all(
      filtered.map(async (uq) => {
        const quest = await ctx.db.get(uq.questId);
        return { ...uq, quest };
      })
    );

    return withDetails;
  },
});

// Claim quest rewards
export const claimQuestRewards = mutation({
  args: { 
    userId: v.id("users"),
    userQuestId: v.id("practiceUserQuests") 
  },
  handler: async (ctx, args) => {
    const userQuest = await ctx.db.get(args.userQuestId);
    if (!userQuest) throw new Error("Quest not found");

    if (userQuest.userId !== args.userId) {
      throw new Error("Not authorized");
    }

    if (userQuest.status === "claimed") {
      throw new Error("Rewards already claimed");
    }

    if (userQuest.status !== "completed") {
      throw new Error("Quest not completed");
    }

    const quest = await ctx.db.get(userQuest.questId);
    if (!quest) throw new Error("Quest not found");

    // Mark as claimed
    await ctx.db.patch(args.userQuestId, {
      status: "claimed",
      claimedAt: Date.now(),
    });

    // TODO: Apply rewards to user profile
    // - Add XP
    // - Award badges
    // - Unlock content

    return {
      success: true,
      rewards: quest.rewards,
    };
  },
});

// Get quest leaderboard
export const getQuestLeaderboard = query({
  args: {
    questId: v.id("practiceQuests"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const userQuests = await ctx.db
      .query("practiceUserQuests")
      .withIndex("by_quest", (q) => q.eq("questId", args.questId))
      .collect();

    // Calculate total progress for each user
    const withProgress = userQuests.map(uq => {
      const totalProgress = uq.progress.reduce((sum, p) => sum + p.current, 0);
      const totalGoal = uq.progress.reduce((sum, p) => sum + p.goal, 0);
      const percentage = totalGoal > 0 ? (totalProgress / totalGoal) * 100 : 0;

      return {
        ...uq,
        totalProgress,
        totalGoal,
        percentage,
      };
    });

    // Sort by completion and progress
    const sorted = withProgress.sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return -1;
      if (a.status !== "completed" && b.status === "completed") return 1;
      return b.percentage - a.percentage;
    });

    // Get user details
    const withUsers = await Promise.all(
      sorted.slice(0, limit).map(async (uq, index) => {
        const user = await ctx.db.get(uq.userId);
        return {
          rank: index + 1,
          user,
          progress: uq.progress,
          percentage: Math.round(uq.percentage),
          status: uq.status,
          completedAt: uq.completedAt,
        };
      })
    );

    return withUsers;
  },
});
