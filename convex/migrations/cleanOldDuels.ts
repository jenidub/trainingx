import { internalMutation } from "../_generated/server";

export const cleanOldDuels = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all practiceDuels
    const allDuels = await ctx.db.query("practiceDuels").collect();
    
    let deletedCount = 0;
    let updatedCount = 0;
    
    for (const duel of allDuels) {
      // If the duel doesn't have hostId, delete it (old format)
      if (!duel.hostId) {
        await ctx.db.delete(duel._id);
        deletedCount++;
      }
      // If it has challengerId but no participants array, update it
      else if (duel.challengerId && (!duel.participants || duel.participants.length === 0)) {
        const participants = [duel.hostId];
        if (duel.challengerId && duel.challengerId !== duel.hostId) {
          participants.push(duel.challengerId);
        }
        if (duel.opponentId && duel.opponentId !== duel.hostId) {
          participants.push(duel.opponentId);
        }
        
        await ctx.db.patch(duel._id, {
          participants,
          readyPlayers: duel.readyPlayers || [],
          scores: duel.scores || {},
        });
        updatedCount++;
      }
    }
    
    return {
      deletedCount,
      updatedCount,
      message: `Cleaned up ${deletedCount} old duels and updated ${updatedCount} duels`,
    };
  },
});
