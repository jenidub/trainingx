import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Flag content for moderation
export const flagContent = mutation({
  args: {
    contentId: v.union(
      v.id("creatorDrafts"),
      v.id("practiceItems"),
      v.id("practiceProjects")
    ),
    contentType: v.string(),
    reason: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const flagId = await ctx.db.insert("practiceModerationFlags", {
      contentId: args.contentId,
      contentType: args.contentType,
      reporterId: user._id,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    });

    return { flagId };
  },
});

// Get pending flags (moderator)
export const getPendingFlags = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // TODO: Add moderator role check
    const limit = args.limit || 20;

    const flags = await ctx.db
      .query("practiceModerationFlags")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("asc")
      .take(limit);

    // Fetch reporter details
    const withReporters = await Promise.all(
      flags.map(async (flag) => {
        const reporter = await ctx.db.get(flag.reporterId);
        return { ...flag, reporter };
      })
    );

    return withReporters;
  },
});

// Resolve flag (moderator)
export const resolveFlag = mutation({
  args: {
    flagId: v.id("practiceModerationFlags"),
    resolution: v.string(),
    action: v.string(), // "dismiss" | "remove_content" | "warn_creator" | "ban_creator"
  },
  handler: async (ctx, args) => {
    // TODO: Add moderator role check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const flag = await ctx.db.get(args.flagId);
    if (!flag) throw new Error("Flag not found");

    await ctx.db.patch(args.flagId, {
      status: "resolved",
      resolution: args.resolution,
      resolvedBy: user._id,
      resolvedAt: Date.now(),
    });

    // Take action based on resolution
    if (args.action === "remove_content") {
      if (flag.contentType === "draft") {
        await ctx.db.patch(flag.contentId as Id<"creatorDrafts">, {
          status: "archived",
        });
      } else if (flag.contentType === "item") {
        await ctx.db.patch(flag.contentId as Id<"practiceItems">, {
          status: "retired",
        });
      }
    }

    return { success: true };
  },
});

// Get flags for content
export const getContentFlags = query({
  args: {
    contentId: v.union(
      v.id("creatorDrafts"),
      v.id("practiceItems"),
      v.id("practiceProjects")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("practiceModerationFlags")
      .withIndex("by_content", (q) => q.eq("contentId", args.contentId))
      .collect();
  },
});
