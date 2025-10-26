import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to list all practice projects
export const list = query({
  args: {
    level: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("practiceProjects").collect();

    // Apply filters
    if (args.level !== undefined) {
      projects = projects.filter(p => p.level === args.level);
    }
    if (args.category) {
      projects = projects.filter(p => p.category === args.category);
    }

    // Sort by level and levelOrder
    projects.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.levelOrder - b.levelOrder;
    });

    return projects;
  },
});

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
