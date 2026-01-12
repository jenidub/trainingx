import { query } from "./_generated/server";

export const checkSlugs = query({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db.query("practiceTracks").collect();
    return tracks.map((t) => ({ title: t.title, slug: t.slug }));
  },
});
