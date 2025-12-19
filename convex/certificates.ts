import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ===== QUERIES =====

// Get all certificates for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const certificates = await ctx.db
      .query("domainCertificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Enrich with domain info
    const enriched = await Promise.all(
      certificates.map(async (cert) => {
        const domain = await ctx.db.get(cert.domainId);
        return {
          ...cert,
          domain: domain
            ? {
                title: domain.title,
                icon: domain.icon,
                slug: domain.slug,
              }
            : null,
        };
      })
    );

    return enriched.sort((a, b) => b.issuedAt - a.issuedAt);
  },
});

// Get certificate by verification code (public)
export const verify = query({
  args: { verificationCode: v.string() },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("domainCertificates")
      .withIndex("by_verification", (q) =>
        q.eq("verificationCode", args.verificationCode)
      )
      .first();

    if (!certificate) {
      return { valid: false, message: "Certificate not found" };
    }

    // Get user and domain info
    const user = await ctx.db.get(certificate.userId);
    const domain = await ctx.db.get(certificate.domainId);

    return {
      valid: true,
      certificate: {
        userName: user?.name || "Anonymous",
        domainTitle: domain?.title || "Unknown Domain",
        domainIcon: domain?.icon,
        score: certificate.score,
        issuedAt: certificate.issuedAt,
        verificationCode: certificate.verificationCode,
      },
    };
  },
});

// Get certificate for a specific domain
export const getByDomain = query({
  args: {
    userId: v.id("users"),
    domainId: v.id("practiceDomains"),
  },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("domainCertificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("domainId"), args.domainId))
      .first();

    return certificate;
  },
});

// ===== MUTATIONS =====

// Update certificate URL (after PDF generation)
export const updateUrl = mutation({
  args: {
    certificateId: v.id("domainCertificates"),
    certificateUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.certificateId, {
      certificateUrl: args.certificateUrl,
    });

    return { success: true };
  },
});
