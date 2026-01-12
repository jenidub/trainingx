import { mutation } from "./_generated/server";

export const resetTrack1 = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    if (!user) return;

    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) =>
        q.eq("slug", "prompt-engineering-fundamentals")
      )
      .first();

    if (!track) return;

    const level = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track_level", (q) =>
        q.eq("trackId", track._id).eq("levelNumber", 1)
      )
      .first();

    if (!level) return;

    const existingProgress = await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) =>
        q.eq("userId", user._id).eq("levelId", level._id)
      )
      .first();

    if (existingProgress) {
      await ctx.db.delete(existingProgress._id);
    }
  },
});
