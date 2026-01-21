import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSession = mutation({
args: {
userId: v.optional(v.string()),
answers: v.array(v.any()),
score: v.optional(v.number()),
completedAt: v.string(),
},
handler: async (ctx, args) => {
const sessionId = await ctx.db.insert("assessmentSessions", {
userId: args.userId,
answers: args.answers,
score: args.score,
completedAt: args.completedAt,
createdAt: new Date().toISOString(),
});
return sessionId;
},
});

export const getSession = query({
args: { sessionId: v.id("assessmentSessions") },
handler: async (ctx, args) => {
return await ctx.db.get(args.sessionId);
},
});

