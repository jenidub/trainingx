# Practice Zone Schema Refactor (Convex)

This document contains the build-ready schema changes needed to support the adaptive Practice Zone, infinite content scale, and Creator Studio features we just scoped.

## Overview

We replace the monolithic `practiceProjects` table with a normalized model that separates tracks, projects, versioned activities, reusable scenarios, parametric templates, and learner telemetry. Existing data can be migrated gradually by mapping each current project into the new tables (see migration sketch below).

## Table Layout

```ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /* …existing tables… */

  practiceTracks: defineTable({
    slug: v.string(),            // e.g. "content", "analytics"
    title: v.string(),
    description: v.string(),
    level: v.number(),           // level 1-3
    icon: v.optional(v.string()),
    order: v.number(),
    tags: v.array(v.string()),
    status: v.string(),          // "draft" | "live" | "archived"
  })
    .index("by_slug", ["slug"])
    .index("by_level", ["level"])
    .index("by_status", ["status"]),

  practiceProjects: defineTable({
    trackId: v.id("practiceTracks"),
    slug: v.string(),
    version: v.string(),         // semver e.g. "1.0.0"
    title: v.string(),
    summary: v.string(),
    estTimeMinutes: v.number(),
    defaultDifficulty: v.number(),  // 1-5
    badgeId: v.optional(v.string()),
    recommendedSkills: v.array(v.string()),
    status: v.string(),          // "draft" | "live" | "deprecated"
    releaseNotes: v.optional(v.string()),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    visibility: v.string(),      // "core" | "seasonal" | "ugc"
  })
    .index("by_slug", ["slug"])
    .index("by_track", ["trackId"])
    .index("by_status", ["status"]),

  practiceActivities: defineTable({
    projectId: v.id("practiceProjects"),
    order: v.number(),
    templateId: v.id("practiceItemTemplates"),
    scenarioId: v.optional(v.id("practiceScenarios")),
    params: v.object({}),        // resolved template params
    required: v.boolean(),
    timeEstimate: v.number(),    // minutes
    difficultyOverride: v.optional(v.number()),
    skills: v.array(v.string()), // targeted skills
    version: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_template", ["templateId"]),

  practiceScenarios: defineTable({
    trackId: v.id("practiceTracks"),
    slug: v.string(),             // e.g. "content-startup-launch"
    title: v.string(),
    narrative: v.string(),        // user-facing context
    variables: v.object({         // reusable key/value pairs
      industry: v.string(),
      audience: v.string(),
      goal: v.string(),
      hooks: v.optional(v.array(v.string())),
    }),
    difficultyHint: v.optional(v.number()),
    tags: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    status: v.string(),           // "draft" | "live" | "retired"
  })
    .index("by_slug", ["slug"])
    .index("by_track", ["trackId"])
    .index("by_status", ["status"]),

  practiceItemTemplates: defineTable({
    type: v.string(),             // "multiple-choice" | "prompt-draft" | …
    title: v.string(),
    description: v.string(),
    schema: v.object({}),         // JSON schema of params
    rubric: v.object({            // scoring rubric used by evaluator
      rubricId: v.string(),
      weights: v.object({}),
      maxScore: v.number(),
    }),
    aiEvaluation: v.object({
      enabled: v.boolean(),
      modelHints: v.optional(v.object({ provider: v.string(), model: v.string() })),
    }),
    recommendedTime: v.number(),
    skills: v.array(v.string()),
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    status: v.string(),           // "draft" | "live" | "deprecated"
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  practiceItems: defineTable({
    templateId: v.id("practiceItemTemplates"),
    scenarioId: v.optional(v.id("practiceScenarios")),
    params: v.object({}),
    version: v.string(),
    elo: v.number(),              // current calibration
    eloDeviation: v.number(),     // standard error estimate
    difficultyBand: v.string(),   // "foundation" | "core" | "challenge"
    tags: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    status: v.string(),           // "live" | "retired" | "experimental"
  })
    .index("by_template", ["templateId"])
    .index("by_scenario", ["scenarioId"])
    .index("by_status", ["status"]),

  practiceAttempts: defineTable({
    userId: v.id("users"),
    itemId: v.id("practiceItems"),
    projectId: v.optional(v.id("practiceProjects")),
    response: v.any(),
    rubricScores: v.optional(v.object({ clarity: v.number(), constraints: v.number(), iteration: v.number(), tool: v.number() })),
    score: v.number(),
    correct: v.boolean(),
    timeMs: v.number(),
    startedAt: v.number(),
    completedAt: v.number(),
    feedback: v.optional(v.string()),
    aiFeedback: v.optional(v.object({ summary: v.string(), suggestions: v.array(v.string()) })),
    metadata: v.optional(v.object({ mode: v.string(), difficultyBand: v.string() })),
  })
    .index("by_user", ["userId"])
    .index("by_item", ["itemId"])
    .index("by_project", ["projectId"]),

  practiceUserSkills: defineTable({
    userId: v.id("users"),
    skillId: v.string(),          // "generative_ai", "planning", etc.
    rating: v.number(),           // Elo value
    deviation: v.number(),        // measurement error
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_skill", ["skillId"]),

  practiceReviewDeck: defineTable({
    userId: v.id("users"),
    itemId: v.id("practiceItems"),
    dueAt: v.number(),
    stability: v.number(),        // SM-2 style scheduling
    difficulty: v.number(),
    lapseCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_due", ["dueAt"]),

  practiceUserPreferences: defineTable({
    userId: v.id("users"),
    interests: v.array(v.string()),    // industries/topics
    goals: v.array(v.string()),        // role targets
    timeBudget: v.string(),            // "short" | "standard" | "deep"
    challengeMode: v.boolean(),
    notifications: v.optional(v.boolean()),
    coachNotes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  practiceCreations: defineTable({
    authorId: v.id("users"),
    type: v.string(),                 // "project" | "item"
    baseId: v.optional(v.id("practiceProjects")), // original reference for remix
    draftData: v.object({}),
    status: v.string(),               // "draft" | "pending" | "published" | "rejected"
    moderationState: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    reviewerId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("by_author", ["authorId"])
    .index("by_status", ["status"]),

  practiceCalibrationRuns: defineTable({
    itemId: v.id("practiceItems"),
    attempts: v.number(),
    meanScore: v.number(),
    standardError: v.number(),
    lastRunAt: v.number(),
    settled: v.boolean(),
  })
    .index("by_item", ["itemId"])
    .index("by_settled", ["settled"]),

  practiceModerationFlags: defineTable({
    contentType: v.string(),        // "item" | "project" | "creation"
    contentId: v.id("practiceItems"),
    reporterId: v.id("users"),
    reason: v.string(),
    notes: v.optional(v.string()),
    status: v.string(),             // "open" | "resolved" | "dismissed"
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_content", ["contentId"])
    .index("by_status", ["status"]),
});
```

### Notes

* Keep existing `practiceProjects` table alive during transition. A migration job can copy records into new `practiceTracks`/`practiceProjects`/`practiceActivities` rows, then mark legacy data as deprecated.
* `practiceItems` and `practiceActivities` are intentionally separate: activities belong to a project run; items are canonical calibrated question variants. Templates power mass generation.
* Elo fields (`elo`, `eloDeviation`, `rating`, `deviation`) support the adaptive engine and calibration queue.

## Migration Sketch

1. **Seed Tracks** from current categories (`Content Creation`, `Education`, etc.) and levels.
2. **Copy Projects**: each legacy JSON file becomes a `practiceProjects` row; the current `steps` map to `practiceActivities`.
3. **Bootstrap Items**: for each activity create an initial `practiceItems` entry referencing a default template (`multiple-choice` or `prompt-draft`) with `elo = 1500`.
4. **Port Attempts**: historical completions move into `practiceAttempts`; set `eloDeviation` high (`350`) until new data arrives.
5. **Backfill Skills**: existing rubric scores can initialize `practiceUserSkills` (map Prompt Score into 4 rubric scores, then into Elo).

## API Touchpoints

* Update `convex/practiceProjects.ts` queries to join the new tables (`practiceProjects`, `practiceActivities`, `practiceItems`, `practiceScenarios`).
* Introduce new mutation endpoints for template creation, scenario management, Elo updates, review deck scheduling, and creator moderation.
* Add server-side helpers for recommendation (`selectNextItems`) and evaluation (`runAiEvaluation`).

## Validation Checklist

- [ ] Type-safety: add new table types to `convex/_generated/dataModel.d.ts`.
- [ ] Access rules: enforce author-only access on drafts, admin-only on moderation.
- [ ] Backward compatibility: keep legacy page working behind a feature flag until new UI ships.
- [ ] Monitoring: log Elo convergence, deck overdue counts, and AI-evaluation errors.

