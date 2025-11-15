import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

// Query to list all practice projects (LEGACY - use listSummary for better performance)
export const list = query({
  args: {
    level: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects = await loadPracticeProjects(ctx, args);

    // Sort by level and levelOrder
    sortProjects(projects);

    return projects;
  },
});

// Optimized query for practice list page - returns only summary data (85% smaller payload)
export const listSummary = query({
  args: {
    level: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects = await loadPracticeProjects(ctx, args);

    // Return only what the list page needs (no stepDetails, no examplePrompts)
    const summary = projects.map(summarizeProject);

    // Sort by level and levelOrder
    sortProjects(summary);

    return summary;
  },
});

// Combined query for practice page - single round trip for projects + user stats
export const getPageData = query({
  args: { 
    userId: v.optional(v.id("users")),
    level: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch projects
    let projects = await loadPracticeProjects(ctx, args);

    // Return lightweight project data
    const projectsSummary = projects.map(summarizeProject);
    sortProjects(projectsSummary);

    // Fetch user stats if userId provided
    let userStats = null;
    if (args.userId) {
      userStats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .first();
    }

    return {
      projects: projectsSummary,
      userStats,
    };
  },
});

type PracticeProjectFilters = {
  level?: number;
  category?: string;
};

async function loadPracticeProjects(ctx: QueryCtx, filters: PracticeProjectFilters) {
  if (filters.level !== undefined) {
    const projects = await ctx.db
      .query("practiceProjects")
      .withIndex("by_level", (q) => q.eq("level", filters.level!))
      .collect();
    if (filters.category) {
      return projects.filter((p) => p.category === filters.category);
    }
    return projects;
  }

  if (filters.category) {
    return await ctx.db
      .query("practiceProjects")
      .withIndex("by_category", (q) => q.eq("category", filters.category!))
      .collect();
  }

  return await ctx.db.query("practiceProjects").collect();
}

type PracticeProjectSummary = Pick<
  Doc<"practiceProjects">,
  "_id" | "slug" | "title" | "description" | "level" | "levelOrder" | "estTime" | "difficulty" | "badge" | "steps" | "buildsSkills" | "isAssessment" | "requiresCompletion" | "category"
>;

function summarizeProject(project: Doc<"practiceProjects">): PracticeProjectSummary {
  return {
    _id: project._id,
    slug: project.slug,
    title: project.title,
    description: project.description,
    level: project.level,
    levelOrder: project.levelOrder,
    estTime: project.estTime,
    difficulty: project.difficulty,
    badge: project.badge,
    steps: project.steps,
    buildsSkills: project.buildsSkills,
    isAssessment: project.isAssessment,
    requiresCompletion: project.requiresCompletion,
    category: project.category,
  };
}

function sortProjects<T extends { level: number; levelOrder: number }>(projects: T[]) {
  projects.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.levelOrder - b.levelOrder;
  });
}

// Query to get a single project by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const project = await ctx.db
      .query("practiceProjects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    
    return project;
  },
});

// Mutation to seed projects from JSON (one-time use)
export const seedProjects = mutation({
  args: {
    projects: v.array(v.object({
      slug: v.string(),
      title: v.string(),
      category: v.string(),
      level: v.number(),
      levelOrder: v.number(),
      estTime: v.string(),
      difficulty: v.number(),
      badge: v.string(),
      steps: v.number(),
      stepDetails: v.array(v.object({
        type: v.string(),
        question: v.string(),
        options: v.array(v.object({
          quality: v.string(),
          text: v.string(),
          explanation: v.string()
        }))
      })),
      buildsSkills: v.array(v.string()),
      description: v.string(),
      isAssessment: v.boolean(),
      requiresCompletion: v.optional(v.array(v.string())),
      examplePrompts: v.optional(v.array(v.object({
        quality: v.string(),
        prompt: v.string(),
        explanation: v.string()
      })))
    }))
  },
  handler: async (ctx, { projects }) => {
    const insertedIds = [];
    
    for (const project of projects) {
      // Check if project already exists
      const existing = await ctx.db
        .query("practiceProjects")
        .withIndex("by_slug", (q) => q.eq("slug", project.slug))
        .first();
      
      if (!existing) {
        const id = await ctx.db.insert("practiceProjects", project);
        insertedIds.push(id);
      }
    }
    
    return {
      inserted: insertedIds.length,
      total: projects.length,
      message: `Seeded ${insertedIds.length} new projects (${projects.length - insertedIds.length} already existed)`
    };
  },
});

// Mutation to update a single project
export const updateProject = mutation({
  args: {
    slug: v.string(),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      level: v.optional(v.number()),
      levelOrder: v.optional(v.number()),
      estTime: v.optional(v.string()),
      difficulty: v.optional(v.number()),
      badge: v.optional(v.string()),
      steps: v.optional(v.number()),
      buildsSkills: v.optional(v.array(v.string())),
      isAssessment: v.optional(v.boolean()),
      requiresCompletion: v.optional(v.array(v.string())),
    })
  },
  handler: async (ctx, { slug, updates }) => {
    const project = await ctx.db
      .query("practiceProjects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    
    if (!project) {
      throw new Error(`Project with slug "${slug}" not found`);
    }
    
    await ctx.db.patch(project._id, updates);
    return project._id;
  },
});

// Mutation to delete all projects (for re-seeding)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("practiceProjects").collect();
    
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }
    
    return { deleted: projects.length };
  },
});
