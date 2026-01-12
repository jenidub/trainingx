"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { callAI } from "../lib/ai";

export const chat = action({
  args: {
    message: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, { message, conversationHistory }) => {
    const userId = await getAuthUserId(ctx);

    // Fetch user's existing matches to provide context
    let matchContext = "The user has not taken the matching quiz yet.";

    if (userId) {
      const matches = await ctx.runQuery(api.aiMatching.getAIMatches, {
        userId,
      });

      if (
        matches &&
        matches.opportunities &&
        matches.opportunities.length > 0
      ) {
        matchContext = `USER'S CURRENT AI CAREER MATCHES:\n${matches.opportunities
          .map(
            (m: any) =>
              `- ${m.title} (${m.type}): ${m.description} (Match Score: ${m.matchScore || "N/A"})\n  Why: ${m.whyPerfectMatch}`
          )
          .join("\n")}`;
      }
    }

    const systemPrompt = `You are the TrainingX.ai AI Career Coach - a friendly, knowledgeable career advisor.

YOUR MISSION: Help the user understand and explore their CURRENT AI career matches.
${matchContext}

RULES:
1. ONLY discuss the matches listed above or general AI career advice.
2. DO NOT offer to generate new matches, roadmaps, or opportunities.
3. If the user asks for a roadmap or new matches, politely explain that you can only help them explore their existing matches or discuss general AI topics.
4. Be encouraging and helpful.
5. Keep answers concise.

Your goal is to help them take action on what they ALREADY have.`;

    // specific system prompt overwrites the default one if passed as first message?
    // callAI expects messages array.

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await callAI(ctx, {
      feature: "career-coach",
      messages: messages,
      temperature: 0.7,
    });

    // callAI returns data as string when jsonMode is false (default)
    const content = response.data;

    // Save conversation
    if (userId) {
      await ctx.runMutation(api.careerCoach.db.saveConversation, {
        userMessage: message,
        assistantResponse: { message: content }, // db schema expects structured object? let's stick to old shape but mostly empty
      });
    }

    return {
      message: content,
      // Return empty arrays for backwards compatibility with frontend types for now
      opportunities: [],
      roadmap: undefined,
      extractedSkills: [],
    };
  },
});
