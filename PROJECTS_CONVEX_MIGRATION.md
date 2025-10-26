# Projects to Convex Migration Guide

## Overview

This guide explains how to migrate the practice zone projects from `projects-seed.json` to Convex database.

## Current State

- **Local**: Projects are loaded from `src/data/projects-seed.json`
- **Convex**: Schema exists but projects table structure doesn't match seed data

## Migration Steps

### 1. Update Convex Schema

The current `projects` table in Convex schema needs to be updated to match the practice zone project structure.

**Current Schema** (generic projects):
```typescript
projects: defineTable({
  title: v.string(),
  description: v.string(),
  difficulty: v.string(),
  category: v.string(),
  // ... generic fields
})
```

**Needed Schema** (practice zone projects):
```typescript
practiceProjects: defineTable({
  slug: v.string(),
  title: v.string(),
  category: v.string(),
  level: v.number(),
  levelOrder: v.number(),
  estTime: v.string(),
  difficulty: v.number(),
  badge: v.string(),
  steps: v.number(),
  stepDetails: v.array(v.object({
    type: v.string(),
    question: v.string(),
    options: v.array(v.object({
      quality: v.string(),
      text: v.string(),
      explanation: v.string()
    }))
  })),
  buildsSkills: v.array(v.string()),
  description: v.string(),
  isAssessment: v.boolean(),
  requiresCompletion: v.optional(v.array(v.string())),
  examplePrompts: v.optional(v.array(v.object({
    quality: v.string(),
    prompt: v.string(),
    explanation: v.string()
  })))
}).index("by_slug", ["slug"])
  .index("by_level", ["level"])
```

### 2. Create Migration Functions

Create `convex/practiceProjects.ts` with:
- `list()` - Get all practice projects
- `getBySlug()` - Get project by slug
- `seedProjects()` - Seed database from JSON (one-time)

### 3. Create Seed Script

Create `scripts/seed-projects.ts` to:
1. Read `projects-seed.json`
2. Call Convex mutation to insert all projects
3. Verify insertion

### 4. Update PracticeZone Component

Switch from:
```typescript
import projectsData from "@/data/projects-seed.json";
```

To:
```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const projects = useQuery(api.practiceProjects.list);
```

### 5. Run Migration

```bash
# 1. Update schema
npm run convex dev

# 2. Run seed script
npm run seed:projects

# 3. Switch App.tsx to use PracticeZoneConvex
# 4. Test the practice zone
```

## Rollback Plan

If issues occur:
1. Switch back to local version in `App.tsx`
2. Projects data remains in JSON file
3. No data loss

## Files to Modify

1. ✅ `convex/schema.ts` - Add practiceProjects table
2. ✅ `convex/practiceProjects.ts` - Create queries/mutations
3. ✅ `scripts/seed-projects.ts` - Create seed script
4. ✅ `package.json` - Add seed script command
5. ⏳ `src/App.tsx` - Switch to PracticeZoneConvex (when ready)

## Benefits of Using Convex

- **Real-time updates**: Projects update across all users instantly
- **Easy management**: Update projects via admin panel
- **Better performance**: Server-side filtering and sorting
- **Analytics**: Track which projects are most popular
- **A/B testing**: Test different project variations
- **Dynamic content**: Add/remove projects without redeploying

## Next Steps

After migration:
1. Create admin panel to manage projects
2. Add project analytics
3. Enable user-generated projects
4. Add project ratings and reviews
