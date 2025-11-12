import { query } from "./_generated/server";

/**
 * Debug utilities to check database status
 */

// Check if practice projects are seeded
export const checkPracticeProjects = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("practiceProjects").collect();
    
    return {
      total: projects.length,
      byLevel: {
        level1: projects.filter(p => p.level === 1).length,
        level2: projects.filter(p => p.level === 2).length,
        level3: projects.filter(p => p.level === 3).length,
      },
      assessments: projects.filter(p => p.isAssessment).length,
      projects: projects.map(p => ({
        slug: p.slug,
        title: p.title,
        level: p.level,
        isAssessment: p.isAssessment,
      })),
    };
  },
});

// Check Phase 1 migration status
export const checkPhase1Status = query({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db.query("practiceTracks").take(5);
    const templates = await ctx.db.query("practiceItemTemplates").take(5);
    const items = await ctx.db.query("practiceItems").take(5);
    const streaks = await ctx.db.query("practiceStreaks").take(5);
    const drills = await ctx.db.query("practiceDailyDrills").take(5);
    const placementTests = await ctx.db.query("placementTests").take(5);

    return {
      legacyProjects: (await ctx.db.query("practiceProjects").collect()).length,
      phase1Tables: {
        tracks: tracks.length,
        templates: templates.length,
        items: items.length,
        streaks: streaks.length,
        drills: drills.length,
        placementTests: placementTests.length,
      },
      status: {
        legacySeeded: (await ctx.db.query("practiceProjects").collect()).length > 0,
        tracksSeeded: tracks.length > 0,
        templatesSeeded: templates.length > 0,
        itemsSeeded: items.length > 0,
      },
    };
  },
});

// Get user stats for debugging
export const checkUserStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(5);
    const userStats = await ctx.db.query("userStats").take(5);
    
    return {
      totalUsers: users.length,
      usersWithStats: userStats.length,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
      })),
      stats: userStats.map(s => ({
        userId: s.userId,
        promptScore: s.promptScore,
        completedProjects: s.completedProjects?.length || 0,
        assessmentComplete: s.assessmentComplete,
      })),
    };
  },
});
