import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

export const getCustomGPTs = query({
  args: {
    userId: v.optional(v.id("users")),
    isPublic: v.optional(v.boolean()),
    category: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const allGpts = await ctx.db.query("customAssistants").collect();

    // Filter by userId, category and limit
    let filtered = allGpts;
    if (args.userId) {
      filtered = filtered.filter(gpt => gpt.creatorId === args.userId);
    }
    if (args.category) {
      filtered = filtered.filter(gpt => gpt.category === args.category);
    }
    if (args.isPublic !== undefined) {
      filtered = filtered.filter(gpt => gpt.isPublic === args.isPublic);
    }
    if (args.limit && args.limit > 0) {
      filtered = filtered.slice(0, args.limit);
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getCustomGPT = query({
  args: { gptId: v.id("customAssistants") },
  handler: async (ctx, { gptId }) => {
    return await ctx.db.get(gptId);
  },
});

export const createCustomGPT = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    creatorId: v.id("users"),
    isPublic: v.boolean(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const gptId = await ctx.db.insert("customAssistants", {
      ...args,
      usageCount: 0,
      averageRating: 0,
      totalRatings: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return gptId;
  },
});

export const updateCustomGPT = mutation({
  args: {
    gptId: v.id("customAssistants"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { gptId, ...updates }) => {
    const gpt = await ctx.db.get(gptId);
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(gptId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
    return gptId;
  },
});

export const deleteCustomGPT = mutation({
  args: { gptId: v.id("customAssistants") },
  handler: async (ctx, { gptId }) => {
    const gpt = await ctx.db.get(gptId);
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    await ctx.db.delete(gptId);
    return true;
  },
});

export const chatWithCustomGPT = action({
  args: {
    gptId: v.id("customAssistants"),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  handler: async (ctx, { gptId, messages }): Promise<{ message: string }> => {
    const gpt = await ctx.runQuery(api.customGPTs.getCustomGPT, { gptId });
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemMessage: { role: "system"; content: string } = {
      role: "system",
      content: gpt.systemPrompt || gpt.description,
    };

    const formattedMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      systemMessage,
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const response: OpenAI.Chat.Completions.ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formattedMessages,
    });

    const assistantMessage: string | null | undefined = response.choices[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    // Update usage count
    await ctx.runMutation(api.customGPTs.updateUsageCount, { gptId });

    return { message: assistantMessage };
  },
});

export const updateUsageCount = mutation({
  args: { gptId: v.id("customAssistants") },
  handler: async (ctx, { gptId }) => {
    const gpt = await ctx.db.get(gptId);
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    await ctx.db.patch(gptId, {
      usageCount: (gpt.usageCount || 0) + 1,
    });
  },
});