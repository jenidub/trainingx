import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create share card
export const createShareCard = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.string(),
    stats: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    // Generate share URL
    const shareId = Math.random().toString(36).substring(7);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareId}`;

    const cardId = await ctx.db.insert("practiceShareCards", {
      userId: user._id,
      type: args.type,
      title: args.title,
      description: args.description,
      stats: args.stats,
      shareUrl,
      viewCount: 0,
      createdAt: Date.now(),
    });

    return { cardId, shareUrl };
  },
});

// Get share card
export const getShareCard = query({
  args: { cardId: v.id("practiceShareCards") },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) return null;

    const user = await ctx.db.get(card.userId);

    return { ...card, user };
  },
});

// Increment share card views
export const incrementShareCardViews = mutation({
  args: { cardId: v.id("practiceShareCards") },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    await ctx.db.patch(args.cardId, {
      viewCount: card.viewCount + 1,
    });

    return { success: true };
  },
});

// Create referral code
export const createReferralCode = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    // Check if user already has a referral code
    const existing = await ctx.db
      .query("practiceReferrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", user._id))
      .first();

    if (existing) {
      return { referralCode: existing.referralCode };
    }

    // Generate unique code
    const code = `${user.name?.substring(0, 3).toUpperCase() || "USR"}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await ctx.db.insert("practiceReferrals", {
      referrerId: user._id,
      referralCode: code,
      status: "pending",
      createdAt: Date.now(),
    });

    return { referralCode: code };
  },
});

// Apply referral code
export const applyReferralCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const referral = await ctx.db
      .query("practiceReferrals")
      .withIndex("by_code", (q) => q.eq("referralCode", args.code))
      .first();

    if (!referral) {
      throw new Error("Invalid referral code");
    }

    if (referral.referrerId === user._id) {
      throw new Error("Cannot use your own referral code");
    }

    if (referral.status !== "pending") {
      throw new Error("Referral code already used");
    }

    // Apply referral
    await ctx.db.patch(referral._id, {
      referredUserId: user._id,
      status: "completed",
      completedAt: Date.now(),
      rewards: {
        referrerXp: 100,
        referredXp: 50,
        unlocks: ["premium_pack_1"],
      },
    });

    // TODO: Apply rewards to both users

    return { success: true, rewards: referral.rewards };
  },
});

// Get user's referrals
export const getUserReferrals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return [];

    return await ctx.db
      .query("practiceReferrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", user._id))
      .collect();
  },
});
