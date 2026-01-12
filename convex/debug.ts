import { mutation } from "./_generated/server";

export const deleteAllProjects = mutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }
    return `Deleted ${projects.length} projects.`;
  },
});
