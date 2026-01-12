import { mutation } from "./_generated/server";

export const fixTrackSlug = mutation({
  args: {},
  handler: async (ctx) => {
    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) =>
        q.eq("slug", "prompt-optimization--debugging")
      )
      .first();

    if (!track) {
      return {
        success: false,
        message: "Track with bad slug not found (maybe already fixed?)",
      };
    }

    await ctx.db.patch(track._id, {
      slug: "prompt-optimization-debugging",
    });

    return {
      success: true,
      message: "Fixed slug for Prompt Optimization & Debugging",
    };
  },
});
