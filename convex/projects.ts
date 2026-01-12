import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProjects = query({
  args: {
    category: v.optional(v.string()),
    difficultyLevel: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db.query("projects").collect();

    // Filter in memory for now as some fields might be optional/missing in old data
    if (args.category && args.category !== "All") {
      tasks = tasks.filter((t) => t.category === args.category);
    }

    if (args.difficultyLevel) {
      tasks = tasks.filter((t) => t.difficultyLevel === args.difficultyLevel);
    }

    if (args.limit) {
      tasks = tasks.slice(0, args.limit);
    }

    return tasks;
  },
});

export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return project;
  },
});

export const seedProjects = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have seeded projects matching our slugs
    const existing = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("slug"), "dentist-landing-page"))
      .first();
    if (existing) {
      console.log(
        "Project 'dentist-landing-page' already exists. Skipping seed."
      );
      return;
    }

    const projects = [
      {
        title: "Dentist Landing Page",
        description:
          "Build a high-converting landing page for a local dentist office. Focus on accessibility and CTA placement.",
        difficulty: "Beginner",
        difficultyLevel: 1,
        category: "Web",
        estimatedHours: 4,
        tags: ["HTML", "CSS", "Responsive"],
        techStack: ["Next.js", "TailwindCSS"],
        xpReward: 100,
        slug: "dentist-landing-page",
        imageUrl: "/images/projects/dentist.webp",
        isPublished: true,
        steps: [],
        requirements: ["Responsive Design", "Booking Form"],
        learningObjectives: ["CSS Grid", "Forms"],
      },
      {
        title: "AI Voice Agent for Restaurant",
        description:
          "Create a voice bot that takes reservations for a busy Italian restaurant using ElevenLabs and Vapi.",
        difficulty: "Advanced",
        difficultyLevel: 5,
        category: "AI",
        estimatedHours: 12,
        tags: ["Voice AI", "Python", "API"],
        techStack: ["Vapi", "OpenAI", "Python"],
        xpReward: 500,
        slug: "restaurant-voice-agent",
        imageUrl: "/images/projects/voice-agent.webp",
        isPublished: true,
        steps: [],
        requirements: ["Low Latency", "Context Awareness"],
        learningObjectives: ["Voice VAD", "LLM Prompting"],
      },
      {
        title: "Retro Space Shooter",
        description:
          "A browser-based arcade shooter using HTML Canvas and JavaScript.",
        difficulty: "Intermediate",
        difficultyLevel: 3,
        category: "Game",
        estimatedHours: 8,
        tags: ["Game Dev", "Spritework"],
        techStack: ["HTML Canvas", "JS"],
        xpReward: 300,
        slug: "space-shooter",
        imageUrl: "/images/projects/space-shooter.webp",
        isPublished: true,
        steps: [],
        requirements: ["Score System", "Collision Detection"],
        learningObjectives: ["Game Loop", "Physics"],
      },
    ];

    // Fetch a fallback user ID.
    const user = await ctx.db.query("users").first();

    if (!user) {
      console.log("No user found to assign project authorship. Seed aborted.");
      // Create a critical error log or duplicate
      return;
    }

    const fallbackId = user._id;
    console.log(`Assigning projects to author: ${fallbackId}`);

    for (const p of projects) {
      await ctx.db.insert("projects", { ...p, authorId: fallbackId });
      console.log(`Seeded project: ${p.title}`);
    }
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});
