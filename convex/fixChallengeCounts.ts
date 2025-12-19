import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const fixChallengeCounts = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all levels
    const levels = await ctx.db.query("practiceLevels").collect();
    let levelsUpdated = 0;

    // 2. Update level challenge counts based on actual items
    for (const level of levels) {
      const items = await ctx.db
        .query("practiceItems")
        .withIndex("by_level", (q) => q.eq("levelId", level._id))
        .collect();

      const realCount = items.length;

      if (level.challengeCount !== realCount) {
        await ctx.db.patch(level._id, {
          challengeCount: realCount,
        });
        levelsUpdated++;
      }
    }

    // 3. Get all tracks
    const tracks = await ctx.db.query("practiceTracks").collect();
    let tracksUpdated = 0;

    // 4. Update track total challenges based on levels
    for (const track of tracks) {
      const trackLevels = await ctx.db
        .query("practiceLevels")
        .withIndex("by_track", (q) => q.eq("trackId", track._id))
        .collect();

      const totalChallenges = trackLevels.reduce((sum, lvl) => {
        // Use the FRESH updated counts if we just updated them
        // But since we didn't re-fetch, we need to be careful.
        // Actually, we patched them, but 'trackLevels' fetch will return updated data?
        // Convex within same transaction:
        // Reads reflect writes?
        // Yes, Convex transaction reads see previous writes in same tx.
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
      message: `Fixed counts for ${levelsUpdated} levels and ${tracksUpdated} tracks`,
      levelsUpdated,
      tracksUpdated,
    };
  },
});
