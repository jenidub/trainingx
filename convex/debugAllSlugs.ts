import { query } from "./_generated/server";

export const checkAllSlugs = query({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db.query("practiceTracks").collect();
    const badSlugs = tracks.filter((t) => t.slug.includes("--"));
    return {
      total: tracks.length,
      badSlugs: badSlugs.map((t) => ({ title: t.title, slug: t.slug })),
      allSlugs: tracks.map((t) => t.slug),
    };
  },
});
