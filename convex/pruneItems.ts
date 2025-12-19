import { mutation } from "./_generated/server";

export const pruneItemsTo12 = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all levels
    const levels = await ctx.db.query("practiceLevels").collect();
    let deletedItems = 0;
    let levelsUpdated = 0;

    // 2. Prune items > 12 for each level
    for (const level of levels) {
      const items = await ctx.db
        .query("practiceItems")
        .withIndex("by_level", (q) => q.eq("levelId", level._id))
        .collect();

      let realCount = items.length;

      // Check if we need to prune
      if (items.length > 12) {
        const extraItems = items.slice(12);
        for (const item of extraItems) {
          await ctx.db.delete(item._id);
          deletedItems++;
        }
        realCount = 12;
      }

      // Sync level definition
      if (level.challengeCount !== realCount) {
        await ctx.db.patch(level._id, {
          challengeCount: realCount,
        });
        levelsUpdated++;
      }
    }

    // 3. Sync Tracks (re-sum levels)
    const tracks = await ctx.db.query("practiceTracks").collect();
    let tracksUpdated = 0;

    for (const track of tracks) {
      const trackLevels = await ctx.db
        .query("practiceLevels")
        .withIndex("by_track", (q) => q.eq("trackId", track._id))
        .collect();

      const totalChallenges = trackLevels.reduce((sum, lvl) => {
        return sum + lvl.challengeCount;
      }, 0);

      if (track.totalChallenges !== totalChallenges) {
        await ctx.db.patch(track._id, {
          totalChallenges: totalChallenges,
        });
        tracksUpdated++;
      }
    }

    return {
      success: true,
      message: `Pruned ${deletedItems} items. Updated ${levelsUpdated} levels and ${tracksUpdated} tracks to max 12 challenges.`,
      deletedItems,
      levelsUpdated,
      tracksUpdated,
    };
  },
});
