# Community Content Moderation Overhaul

**Date:** 2026-01-09  
**Status:** Implementation Plan  
**Priority:** Critical - Platform Safety

---

## 🎯 The Vision

We're not just fixing bugs—we're building a trust layer that protects our community while remaining invisible to legitimate users. Great moderation is like great design: when it works, you don't notice it.

The goal: **A multi-layered, server-verified moderation system that checks text with GPT-5.2-nano, properly samples videos, and blocks harmful content before it ever reaches the database.**

---

## 📐 Architecture Philosophy

### Current Flow (Broken)

```
User → Frontend Check (bypassable) → Database (no validation) → Published
```

### New Flow (Defense in Depth)

```
User → Frontend Fast Check → Server Moderation Gate → Approved? → Database
                                     ↓ NO
                              Rejection + Audit Log
```

**Key Principles:**

1. **Never trust the client** - All moderation verified server-side
2. **Fail safe** - When uncertain, queue for review rather than auto-publish
3. **Fast path for clean content** - 95%+ of content passes instantly
4. **Audit everything** - Full trail for compliance and improvement
5. **Graceful degradation** - If AI is down, fall back to rules-based checks
6. **Rate limit abuse** - Prevent spam attacks on moderation endpoint
7. **Single API call** - Combine title + content to minimize cost/latency

---

## 🗂️ Implementation Phases

### Phase 1: Schema & Foundation

**Duration:** 1 hour

#### 1.1 Add Moderation Tables to Schema

```typescript
// convex/schema.ts - New tables

// Content moderation queue
moderationQueue: defineTable({
  contentType: v.string(),           // "post" | "comment"
  contentId: v.optional(v.id("posts")),
  commentId: v.optional(v.id("comments")),
  authorId: v.id("users"),

  // Content to moderate
  text: v.string(),
  mediaStorageIds: v.optional(v.array(v.id("_storage"))),

  // Moderation results
  textModerationResult: v.optional(v.object({
    approved: v.boolean(),
    categories: v.array(v.string()),   // ["harassment", "hate", "violence", etc.]
    scores: v.any(),                    // Raw scores from GPT
    reasoning: v.optional(v.string()),
  })),
  mediaModerationResult: v.optional(v.object({
    approved: v.boolean(),
    flaggedMedia: v.array(v.object({
      storageId: v.id("_storage"),
      reason: v.string(),
      score: v.number(),
    })),
  })),

  // Status
  status: v.string(),                 // "pending" | "approved" | "rejected" | "manual_review"
  processedAt: v.optional(v.number()),
  reviewedBy: v.optional(v.id("users")),  // If manual review
  reviewNotes: v.optional(v.string()),

  createdAt: v.number(),
})
  .index("by_status", ["status"])
  .index("by_author", ["authorId"])
  .index("by_content", ["contentId"]),

// Moderation audit log
moderationAuditLog: defineTable({
  action: v.string(),                  // "auto_approve" | "auto_reject" | "manual_approve" | "manual_reject"
  contentType: v.string(),
  contentId: v.optional(v.id("posts")),
  commentId: v.optional(v.id("comments")),
  authorId: v.id("users"),

  // What was checked
  textChecked: v.boolean(),
  mediaChecked: v.boolean(),

  // Results
  textResult: v.optional(v.object({
    approved: v.boolean(),
    flaggedCategories: v.array(v.string()),
    model: v.string(),
    tokensUsed: v.number(),
    latencyMs: v.number(),
  })),
  mediaResult: v.optional(v.object({
    approved: v.boolean(),
    framesChecked: v.number(),
    flaggedFrames: v.number(),
  })),

  finalDecision: v.string(),           // "approved" | "rejected" | "escalated"
  reasoning: v.optional(v.string()),

  // Performance
  totalLatencyMs: v.number(),
  estimatedCost: v.number(),

  createdAt: v.number(),
})
  .index("by_date", ["createdAt"])
  .index("by_author", ["authorId"])
  .index("by_decision", ["finalDecision"]),
```

#### 1.2 Add Post Moderation Status Field

```typescript
// Update posts table
posts: defineTable({
  // ... existing fields ...

  // NEW: Moderation status
  moderationStatus: v.optional(v.string()), // "pending" | "approved" | "rejected"
  moderationId: v.optional(v.id("moderationQueue")),
});
```

---

### Phase 2: Server-Side Text Moderation with GPT-5.2-nano

**Duration:** 2 hours

> **Optimization:** We combine title + content into a SINGLE GPT call to save 50% on API costs and reduce latency by ~100ms.

#### 2.1 Create Moderation Action

```typescript
// convex/contentModeration.ts

import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Moderation categories we detect
const MODERATION_CATEGORIES = [
  "harassment",
  "hate_speech",
  "violence",
  "sexual_content",
  "self_harm",
  "spam",
  "misinformation",
  "personal_info",
] as const;

type ModerationCategory = (typeof MODERATION_CATEGORIES)[number];

// Result can be approved, rejected, or escalated for human review
type ModerationDecision = "approved" | "rejected" | "needs_review";

interface TextModerationResult {
  decision: ModerationDecision;
  approved: boolean; // Quick boolean check (true only if decision === "approved")
  categories: ModerationCategory[];
  scores: Record<string, number>;
  reasoning?: string;
  confidence: number; // 0-1, used for escalation logic
}

/**
 * Moderate text content using GPT-5.2-nano
 *
 * This is the single source of truth for text moderation.
 * Fast, cheap, and effective.
 */
export const moderateText = action({
  args: {
    text: v.string(),
    context: v.object({
      contentType: v.string(), // "post_title" | "post_content" | "comment"
      authorId: v.id("users"),
    }),
  },
  handler: async (ctx, args): Promise<TextModerationResult> => {
    const startTime = Date.now();

    // Quick pre-filter: empty or very short content
    if (!args.text.trim() || args.text.length < 3) {
      return { approved: true, categories: [], scores: {} };
    }

    const prompt = buildModerationPrompt(args.text, args.context.contentType);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-5.2-nano", // Smallest, fastest model
            messages: [
              {
                role: "system",
                content: MODERATION_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0, // Deterministic
            max_tokens: 200, // Short response
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        // Fallback to rules-based if API fails
        console.error("GPT moderation failed, using fallback");
        return fallbackRulesCheck(args.text);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      // Log for auditing
      const latencyMs = Date.now() - startTime;
      await ctx.runMutation(internal.contentModeration.logModerationCall, {
        feature: "text_moderation",
        model: "gpt-5.2-nano",
        tokensUsed: data.usage?.total_tokens || 0,
        latencyMs,
        success: true,
        result: result.approved ? "approved" : "rejected",
      });

      // Determine decision based on confidence
      const maxScore = Math.max(
        ...Object.values(result.category_scores || { none: 0 })
      );
      const confidence = result.approved ? 1 - maxScore : maxScore;

      let decision: ModerationDecision;
      if (result.approved) {
        decision = "approved";
      } else if (confidence < 0.6) {
        // Borderline case (score 0.3-0.6) - escalate for human review
        decision = "needs_review";
      } else {
        decision = "rejected";
      }

      return {
        decision,
        approved: decision === "approved",
        categories: result.flagged_categories || [],
        scores: result.category_scores || {},
        reasoning: result.reasoning,
        confidence,
      };
    } catch (error) {
      console.error("Moderation error:", error);
      // On error, use conservative fallback
      return fallbackRulesCheck(args.text);
    }
  },
});

const MODERATION_SYSTEM_PROMPT = `You are a content moderation system for an educational AI training platform. Your job is to determine if user-generated content is appropriate for a professional learning community.

CONTEXT: This is a community forum where learners share AI prompting tips, project showcases, achievements, and questions. The audience includes students, professionals, and educators.

EVALUATE for these categories:
- harassment: Personal attacks, bullying, targeted insults
- hate_speech: Discrimination based on race, gender, religion, etc.
- violence: Threats, graphic violence, harm promotion
- sexual_content: Explicit content, sexual language
- self_harm: Self-harm promotion or instructions
- spam: Repetitive content, unsolicited promotion
- misinformation: Dangerous false claims
- personal_info: Sharing of private data (SSN, passwords, etc.)

RESPOND with JSON:
{
  "approved": true/false,
  "flagged_categories": ["category1", ...],
  "category_scores": {"harassment": 0.0-1.0, ...},
  "reasoning": "Brief explanation if rejected"
}

GUIDELINES:
- Professional critique is NOT harassment
- Discussion of sensitive topics in educational context is OK
- When in doubt, approve and flag for human review
- Be culturally aware - avoid over-flagging legitimate content`;

function buildModerationPrompt(text: string, contentType: string): string {
  return `[${contentType.toUpperCase()}]
  
Content to moderate:
"""
${text.substring(0, 4000)}
"""

Analyze this content and respond with your moderation decision.`;
}

function fallbackRulesCheck(text: string): TextModerationResult {
  const lower = text.toLowerCase();
  const categories: ModerationCategory[] = [];

  // Basic blocklist patterns (expand as needed)
  const patterns = {
    hate_speech: /\b(n[i1]gg[ae]r|f[a@]gg[o0]t|k[i1]ke)\b/i,
    harassment: /\b(kill yourself|kys|go die)\b/i,
    sexual_content: /\b(porn|xxx|nsfw|hentai)\b/i,
    personal_info: /\b(\d{3}-\d{2}-\d{4}|password\s*[:=])/i,
  };

  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(lower)) {
      categories.push(category as ModerationCategory);
    }
  }

  return {
    decision: categories.length === 0 ? "approved" : "rejected",
    approved: categories.length === 0,
    categories,
    scores: {},
    reasoning:
      categories.length > 0
        ? `Matched rules-based filter: ${categories.join(", ")}`
        : undefined,
    confidence: categories.length === 0 ? 1.0 : 0.9, // High confidence for rules-based
  };
}
```

#### 2.2 Add Internal Logging Mutation

```typescript
// Add to contentModeration.ts

export const logModerationCall = internalMutation({
  args: {
    feature: v.string(),
    model: v.string(),
    tokensUsed: v.number(),
    latencyMs: v.number(),
    success: v.boolean(),
    result: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiLogs", {
      feature: args.feature,
      provider: "openai",
      model: args.model,
      promptTokens: Math.floor(args.tokensUsed * 0.7), // Estimate
      completionTokens: Math.floor(args.tokensUsed * 0.3),
      totalTokens: args.tokensUsed,
      cost: args.tokensUsed * 0.00001, // Nano pricing estimate
      latencyMs: args.latencyMs,
      success: args.success,
      errorMessage: args.errorMessage,
      metadata: { result: args.result },
      createdAt: Date.now(),
    });
  },
});

/**
 * Queue borderline content for manual review
 */
export const queueForReview = internalMutation({
  args: {
    contentType: v.string(),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    media: v.optional(v.any()),
    moderationResult: v.any(),
  },
  handler: async (ctx, args) => {
    const queueId = await ctx.db.insert("moderationQueue", {
      contentType: args.contentType,
      authorId: args.authorId,
      text: `${args.title}\n\n${args.content}`,
      textModerationResult: {
        approved: false,
        categories: args.moderationResult.categories,
        scores: args.moderationResult.scores,
        reasoning: args.moderationResult.reasoning,
      },
      status: "pending",
      createdAt: Date.now(),
    });

    // Optionally notify moderators here (webhook, email, etc.)

    return queueId;
  },
});
```

#### 2.3 Rate Limiting Query

```typescript
// convex/posts.ts - Add rate limit check

export const getRecentPostCount = internalQuery({
  args: {
    authorId: v.id("users"),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .filter((q) => q.gte(q.field("createdAt"), args.since))
      .collect();

    return posts.length;
  },
});
```

---

### Phase 3: Video Multi-Frame Sampling

**Duration:** 1.5 hours

#### 3.1 Enhanced Video Moderation (Frontend)

```typescript
// app/(routes)/community/page.tsx - Replace sampleMediaToCanvas for videos

const VIDEO_SAMPLE_POINTS = [0.05, 0.2, 0.4, 0.6, 0.8, 0.95]; // 6 frames across video

const sampleVideoMultiFrame = async (
  file: File
): Promise<{
  flagged: boolean;
  maxScore: number;
  flaggedFrames: number;
  details: Array<{ time: number; score: number; label?: string }>;
}> => {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.crossOrigin = "anonymous";
  video.muted = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Video load failed"));
  });

  const duration = video.duration;
  const results: Array<{
    time: number;
    score: number;
    label?: string;
    flagged: boolean;
  }> = [];

  let flaggedCount = 0;
  let maxScore = 0;

  for (const point of VIDEO_SAMPLE_POINTS) {
    const targetTime = duration * point;
    video.currentTime = targetTime;

    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    // Create canvas for this frame
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(320, Math.max(1, video.videoWidth));
    canvas.height = Math.min(320, Math.max(1, video.videoHeight));
    const ctx = canvas.getContext("2d");

    if (!ctx) continue;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Run both skin detection and NSFW model
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const skinCoverage = calculateSkinRatio(data);
    const nsfwResult = await runTinyNsfwCheck(canvas);

    const frameScore = Math.max(
      skinCoverage / NSFW_SKIN_THRESHOLD, // Normalize to 0-1+ scale
      nsfwResult.score || 0
    );

    const frameFlagged =
      skinCoverage >= NSFW_SKIN_THRESHOLD || nsfwResult.flagged;

    results.push({
      time: targetTime,
      score: frameScore,
      label: nsfwResult.label,
      flagged: frameFlagged,
    });

    if (frameFlagged) flaggedCount++;
    if (frameScore > maxScore) maxScore = frameScore;
  }

  URL.revokeObjectURL(video.src);

  // Video is flagged if ANY frame is flagged
  // Could also use threshold like "2+ frames flagged"
  return {
    flagged: flaggedCount > 0,
    maxScore,
    flaggedFrames: flaggedCount,
    details: results,
  };
};
```

#### 3.2 Integrate Multi-Frame Check in handleMediaSelected

```typescript
// Replace single-frame check with multi-frame for videos

if (isVideo) {
  // ... existing compression logic ...

  // Multi-frame NSFW check
  const videoCheckResult = await sampleVideoMultiFrame(processedFile);

  flagged = videoCheckResult.flagged;
  flagReason = flagged
    ? `NSFW content detected in ${videoCheckResult.flaggedFrames} of ${VIDEO_SAMPLE_POINTS.length} frames (max score: ${Math.round(videoCheckResult.maxScore * 100)}%)`
    : undefined;
} else {
  // Existing single-frame check for images
  const { canvas, coverage } = await sampleMediaToCanvas(
    processedFile,
    "image"
  );
  const nsfwResult = await runTinyNsfwCheck(canvas);
  // ... existing logic ...
}
```

---

### Phase 4: Server-Side Moderation Gate

**Duration:** 2 hours

#### 4.1 Create Moderated Post Creation Flow

```typescript
// convex/posts.ts - Replace createPost with moderated version

import { action, mutation, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";

/**
 * Create a post with full moderation pipeline
 *
 * Flow:
 * 1. Client submits post
 * 2. Server moderates text with GPT-5.2-nano
 * 3. If approved, insert post
 * 4. If rejected, return error with reason
 */
export const createModeratedPost = action({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    category: v.string(),
    tags: v.array(v.string()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          url: v.string(),
          type: v.union(v.literal("image"), v.literal("video")),
          name: v.optional(v.string()),
          sizeMb: v.optional(v.number()),
          duration: v.optional(v.number()),
          // NEW: Client-side moderation result (for audit, not trust)
          clientModerationPassed: v.optional(v.boolean()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Step 0: Rate limiting - max 3 posts per minute per user
    const oneMinuteAgo = Date.now() - 60000;
    const recentPosts = await ctx.runQuery(internal.posts.getRecentPostCount, {
      authorId: args.authorId,
      since: oneMinuteAgo,
    });

    if (recentPosts >= 3) {
      return {
        success: false,
        reason: "rate_limited",
        message: "Slow down! You can post up to 3 times per minute.",
        categories: [],
      };
    }

    // Step 1: Moderate title + content in SINGLE call (50% cost savings)
    const combinedText = `[TITLE]\n${args.title}\n\n[CONTENT]\n${args.content}`;
    const moderationResult = await ctx.runAction(
      api.contentModeration.moderateText,
      {
        text: combinedText,
        context: { contentType: "post_full", authorId: args.authorId },
      }
    );

    // Handle different decisions
    if (moderationResult.decision === "rejected") {
      return {
        success: false,
        reason: "content_rejected",
        message: `Your post was flagged for: ${moderationResult.categories.join(", ")}. Please revise and try again.`,
        categories: moderationResult.categories,
      };
    }

    if (moderationResult.decision === "needs_review") {
      // Queue for manual review instead of immediate publishing
      const queueId = await ctx.runMutation(
        internal.contentModeration.queueForReview,
        {
          contentType: "post",
          authorId: args.authorId,
          title: args.title,
          content: args.content,
          category: args.category,
          tags: args.tags,
          media: args.media,
          moderationResult,
        }
      );

      return {
        success: false,
        reason: "pending_review",
        message:
          "Your post is being reviewed by our team. This usually takes a few minutes.",
        categories: moderationResult.categories,
        queueId,
      };
    }

    // Step 3: Create the post (all checks passed)
    const postId = await ctx.runMutation(internal.posts.insertPost, {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      category: args.category,
      tags: args.tags,
      media: args.media,
      moderationStatus: "approved",
    });

    // Step 4: Log to audit trail
    await ctx.runMutation(internal.contentModeration.createAuditLog, {
      action: "auto_approve",
      contentType: "post",
      contentId: postId,
      authorId: args.authorId,
      textChecked: true,
      mediaChecked: false, // Frontend handles media
      textResult: {
        approved: true,
        flaggedCategories: [],
        model: "gpt-5.2-nano",
        tokensUsed: 0, // Will be tracked in aiLogs
        latencyMs: Date.now() - startTime,
      },
      finalDecision: "approved",
      totalLatencyMs: Date.now() - startTime,
      estimatedCost: 0.001, // Minimal
    });

    return {
      success: true,
      postId,
    };
  },
});

// Internal mutation to insert post (bypasses action limitations)
export const insertPost = internalMutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    category: v.string(),
    tags: v.array(v.string()),
    media: v.optional(v.any()),
    moderationStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      category: args.category,
      tags: args.tags,
      media: args.media || [],
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      moderationStatus: args.moderationStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user stats
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.authorId))
      .first();

    if (userStats) {
      await ctx.db.patch(userStats._id, {
        communityActivity: {
          ...userStats.communityActivity,
          postsCreated: userStats.communityActivity.postsCreated + 1,
          communityScore: userStats.communityActivity.communityScore + 5,
        },
      });
    }

    return postId;
  },
});
```

#### 4.2 Add Comment Moderation

```typescript
// convex/posts.ts - Add moderated comment creation

export const createModeratedComment = action({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    // Moderate comment content
    const result = await ctx.runAction(api.contentModeration.moderateText, {
      text: args.content,
      context: { contentType: "comment", authorId: args.authorId },
    });

    if (!result.approved) {
      return {
        success: false,
        reason: "comment_rejected",
        message: `Your comment was flagged for: ${result.categories.join(", ")}`,
      };
    }

    // Insert comment
    const commentId = await ctx.runMutation(internal.posts.insertComment, {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      parentId: args.parentId,
    });

    return { success: true, commentId };
  },
});

export const insertComment = internalMutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      parentId: args.parentId,
      upvotes: 0,
      downvotes: 0,
      isEdited: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update post reply count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        replyCount: post.replyCount + 1,
      });
    }

    return commentId;
  },
});
```

---

### Phase 5: Frontend Integration

**Duration:** 1.5 hours

#### 5.1 Update Post Creation UI

```typescript
// app/(routes)/community/page.tsx - Update handleCreatePost

const handleCreatePost = async () => {
  if (!user?._id || !postTitle.trim() || !postContent.trim()) return;

  setIsAnalyzing(true);

  try {
    // Upload media first (same as before)
    const uploadedMedia = [...]; // existing upload logic

    // Call moderated post creation
    const result = await createModeratedPost({
      title: postTitle,
      content: postContent,
      authorId: user._id as Id<"users">,
      category: postCategory,
      tags: [],
      media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
    });

    if (!result.success) {
      // Handle rejection
      toast({
        title: "Post Not Published",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    // Success - clear form
    setPostTitle("");
    setPostContent("");
    setPostCategory("general");
    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setIsCreateModalOpen(false);

    toast({
      title: "Post Created!",
      description: "+5 points for creating a post!",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create post. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsAnalyzing(false);
  }
};
```

#### 5.2 Block NSFW Media Uploads

```typescript
// Change from warning to blocking for flagged media

if (flagged) {
  toast({
    title: "Media Rejected",
    description:
      flagReason ||
      "This media was flagged as potentially inappropriate and cannot be uploaded.",
    variant: "destructive",
  });
  // DON'T add to newMedia array - skip this file
  continue;
}
```

---

### Phase 6: Audit & Admin Dashboard

**Duration:** 1 hour (Optional, can defer)

#### 6.1 Moderation Stats Query

```typescript
// convex/admin.ts - Add moderation stats

export const getModerationStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Verify admin role here

    const daysAgo = args.days || 7;
    const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("moderationAuditLog")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    return {
      total: logs.length,
      approved: logs.filter((l) => l.finalDecision === "approved").length,
      rejected: logs.filter((l) => l.finalDecision === "rejected").length,
      escalated: logs.filter((l) => l.finalDecision === "escalated").length,
      avgLatencyMs:
        logs.reduce((sum, l) => sum + l.totalLatencyMs, 0) / logs.length || 0,
      totalCost: logs.reduce((sum, l) => sum + l.estimatedCost, 0),
    };
  },
});
```

---

## 🎭 UX States During Evaluation

### Post Button States

```typescript
// Three distinct states for the submit button

type SubmitState =
  | "idle"           // Default - "Create Post"
  | "uploading"      // "Uploading media..."
  | "evaluating"     // "Evaluating content..."
  | "submitting";    // "Publishing..."

// UI Component
<JuicyButton
  onClick={handleCreatePost}
  disabled={submitState !== "idle" || !postTitle.trim() || !postContent.trim()}
  className="gap-2 w-full"
>
  {submitState === "idle" && (
    <>
      <Send className="h-5 w-5" />
      Create Post
    </>
  )}
  {submitState === "uploading" && (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      Uploading media...
    </>
  )}
  {submitState === "evaluating" && (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      Evaluating content...
    </>
  )}
  {submitState === "submitting" && (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      Publishing...
    </>
  )}
</JuicyButton>
```

### Progress Indicator (for video posts)

```typescript
// Show step-by-step progress for complex posts
{submitState !== "idle" && (
  <div className="mt-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
    <div className="space-y-2">
      <ProgressStep
        label="Uploading media"
        status={mediaUploadComplete ? "done" : submitState === "uploading" ? "active" : "pending"}
      />
      <ProgressStep
        label="Checking content policy"
        status={evaluationComplete ? "done" : submitState === "evaluating" ? "active" : "pending"}
      />
      <ProgressStep
        label="Publishing to community"
        status={submitState === "submitting" ? "active" : "pending"}
      />
    </div>
    <p className="text-xs text-slate-400 mt-3">
      This helps keep our community safe and welcoming ✨
    </p>
  </div>
)}

// ProgressStep component
function ProgressStep({ label, status }: { label: string; status: "pending" | "active" | "done" }) {
  return (
    <div className="flex items-center gap-3">
      {status === "done" && <CheckCircle className="h-5 w-5 text-green-500" />}
      {status === "active" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
      {status === "pending" && <Circle className="h-5 w-5 text-slate-300" />}
      <span className={cn(
        "text-sm font-medium",
        status === "done" && "text-green-600",
        status === "active" && "text-blue-600",
        status === "pending" && "text-slate-400"
      )}>
        {label}
      </span>
    </div>
  );
}
```

### Failure States

```typescript
// When moderation rejects content - show clear, helpful error

if (!result.success) {
  // Determine user-friendly message based on rejection reason
  const friendlyMessages: Record<string, { title: string; description: string; icon: string; variant?: "default" | "destructive" }> = {
    // Rate limiting
    rate_limited: {
      title: "Slow Down!",
      description: "You're posting too quickly. Please wait a moment before trying again.",
      icon: "⏳",
      variant: "default",  // Not destructive - just a pause
    },
    // Pending review (borderline content)
    pending_review: {
      title: "Under Review",
      description: "Your post is being reviewed by our team. You'll be notified once it's approved.",
      icon: "👀",
      variant: "default",  // Informational, not an error
    },
    // Rejections
    harassment: {
      title: "Content Policy Violation",
      description: "Your post contains language that could be hurtful to others. Please revise and try again.",
      icon: "🚫",
    },
    hate_speech: {
      title: "Content Not Allowed",
      description: "This content violates our community guidelines against discriminatory language.",
      icon: "⛔",
    },
    sexual_content: {
      title: "Inappropriate Content",
      description: "This type of content isn't appropriate for our learning community.",
      icon: "🔞",
    },
    spam: {
      title: "Looks Like Spam",
      description: "This post was flagged as spam. Make sure your content adds value to the community.",
      icon: "📭",
    },
    default: {
      title: "Post Not Published",
      description: "Your post doesn't meet our community guidelines. Please review and revise.",
      icon: "❌",
    },
  };

  // Use reason first (rate_limited, pending_review), then fall back to category
  const key = result.reason && friendlyMessages[result.reason]
    ? result.reason
    : result.categories?.[0] || "default";
  const msg = friendlyMessages[key] || friendlyMessages.default;

  toast({
    title: `${msg.icon} ${msg.title}`,
    description: msg.description,
    variant: "destructive",
    duration: 8000,  // Show longer for error messages
  });

  // Optional: Show inline error in the form
  setModerationError({
    field: result.reason === "title_rejected" ? "title" : "content",
    message: msg.description,
  });

  return;
}

// Inline error display
{moderationError && (
  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-red-700">
        {moderationError.field === "title" ? "Title issue:" : "Content issue:"}
      </p>
      <p className="text-sm text-red-600">{moderationError.message}</p>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setModerationError(null)}
      className="ml-auto"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
)}
```

---

## ⏱️ Worst-Case Timing Analysis

### Scenario: Video Post with Text

| Step | Operation                      | Time     | Notes                              |
| ---- | ------------------------------ | -------- | ---------------------------------- |
| 1    | Video compression (FFmpeg)     | 2-8s     | Depends on video size; 50MB → 15MB |
| 2    | Video NSFW check (6 frames)    | 1.5-3s   | Frontend, parallel with nothing    |
| 3    | Upload video to Convex storage | 1-4s     | Depends on connection; 15MB upload |
| 4    | Upload images (if any)         | 0.5-2s   | Up to 3 images                     |
| 5    | Text moderation (GPT-5.2-nano) | 0.1-0.3s | Title + content, very fast         |
| 6    | Database insert                | 0.05s    | Instant                            |

### Total Worst Case: **~5-8 seconds**

```
[User clicks Post]
    ↓
[0.0s] Start: "Uploading media..."
    ↓
[4.0s] Media uploaded: "Evaluating content..."
    ↓
[4.3s] Text approved: "Publishing..."
    ↓
[4.4s] Done: "Post Created! ✨"
```

### Best Case (Text-Only Post): **~300-500ms**

```
[User clicks Post]
    ↓
[0.0s] Start: "Evaluating content..."
    ↓
[0.3s] Text approved: "Publishing..."
    ↓
[0.4s] Done: "Post Created! ✨"
```

### Optimization Note

The video NSFW check happens **during file selection** (before user clicks Post), not during submission. This means:

- User selects video → 1-3s NSFW check happens
- User writes post content
- User clicks Post → Only upload + text check (faster)

---

## 📊 Summary of Changes

| File                              | Changes                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `convex/schema.ts`                | Add `moderationQueue`, `moderationAuditLog` tables; update `posts`            |
| `convex/contentModeration.ts`     | **NEW** - GPT-5.2-nano text moderation action                                 |
| `convex/posts.ts`                 | Replace `createPost` with `createModeratedPost`; add `createModeratedComment` |
| `app/(routes)/community/page.tsx` | Multi-frame video check; Block flagged content; Use moderated mutations       |
| `convex/admin.ts`                 | Add `getModerationStats` query                                                |

---

## ⚡ Performance Expectations

| Check Type          | Expected Latency     | Cost per Request |
| ------------------- | -------------------- | ---------------- |
| Text (GPT-5.2-nano) | 100-300ms            | ~$0.0001         |
| Video (6 frames)    | 1-3s (frontend)      | Free             |
| Image (1 frame)     | 200-500ms (frontend) | Free             |

---

## 🧪 Testing Checklist

- [ ] Post with clean content → Approved instantly
- [ ] Post with profanity → Rejected with clear message
- [ ] Comment with harassment → Rejected
- [ ] Image with skin tones (medical, fitness) → May flag but not block (threshold tuning)
- [ ] Video with NSFW at 30s mark → Detected and blocked
- [ ] API failure → Falls back to rules-based, still functions

---

## 🚀 Deployment Order

1. Deploy schema changes (non-breaking)
2. Deploy `contentModeration.ts` action
3. Deploy updated `posts.ts` mutations
4. Deploy frontend changes
5. Monitor audit logs and tune thresholds

---

## 🎯 Success Metrics

- **False Positive Rate**: < 0.1% (clean content incorrectly blocked)
- **False Negative Rate**: < 1% (harmful content slipping through)
- **Average Moderation Latency**: < 500ms
- **Cost per 1000 posts**: < $0.10

---

_This plan transforms our community from vulnerable to bulletproof while maintaining the fast, frictionless experience our users expect._
