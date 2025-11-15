import { internalMutation } from "../_generated/server";

export const backfillDuelMembers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("practiceDuels").collect();
    let inserted = 0;

    for (const room of rooms) {
      for (const participant of room.participants) {
        const existing = await ctx.db
          .query("practiceDuelMembers")
          .withIndex("by_user", (q) => q.eq("userId", participant))
          .filter((q) => q.eq(q.field("duelId"), room._id))
          .first();

        if (!existing) {
          await ctx.db.insert("practiceDuelMembers", {
            duelId: room._id,
            userId: participant,
            status: room.status,
            joinedAt: room.startedAt,
            updatedAt: Date.now(),
          });
          inserted += 1;
        }
      }
    }

    return { inserted };
  },
});
