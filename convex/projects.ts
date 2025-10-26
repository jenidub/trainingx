import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProjects = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number()),
    isPublished: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("projects").collect();

    // Apply filters
    if (args.category) {
      projects = projects.filter(p => p.category === args.category);
    }
    if (args.difficulty) {
      projects = projects.filter(p => p.difficulty === args.difficulty);
    }
    if (args.isPublished !== undefined) {
      projects = projects.filter(p => p.isPublished === args.isPublished);
    }
    if (args.limit && args.limit > 0) {
      projects = projects.slice(0, args.limit);
    }

    // Sort by creation date (newest first)
    projects.sort((a, b) => b._creationTime - a._creationTime);

    return projects;
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    return project;
  },
});

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    difficulty: v.string(),
    category: v.string(),
    estimatedHours: v.number(),
    tags: v.array(v.string()),
    authorId: v.id("users"),
    isPublished: v.boolean(),
    steps: v.array(v.object({
      title: v.string(),
      content: v.string(),
      codeExample: v.optional(v.string()),
      resources: v.array(v.string()),
      order: v.number()
    })),
    requirements: v.array(v.string()),
    learningObjectives: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", args);
    return projectId;
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    category: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
    steps: v.optional(v.array(v.object({
      title: v.string(),
      content: v.string(),
      codeExample: v.optional(v.string()),
      resources: v.array(v.string()),
      order: v.number()
    }))),
    requirements: v.optional(v.array(v.string())),
    learningObjectives: v.optional(v.array(v.string()))
  },
  handler: async (ctx, { projectId, ...updates }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Remove undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(projectId, filteredUpdates);
    return projectId;
  },
});