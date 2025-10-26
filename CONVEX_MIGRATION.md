# Convex Migration Guide

## Overview

The Dashboard and Portfolio sections have been migrated from localStorage to Convex database. This provides:

- **Real-time sync** across devices
- **Persistent data** that survives browser cache clears
- **Better performance** with server-side queries
- **Data integrity** with proper database schema

## What Changed

### Before (localStorage)
- User stats stored in browser's localStorage
- Data lost when clearing browser cache
- No sync across devices
- Limited to client-side only

### After (Convex)
- User stats stored in Convex database
- Data persists across sessions and devices
- Real-time updates
- Server-side validation and queries

## Updated Components

### 1. **Dashboard** (`src/pages/Dashboard.tsx`)
- Now uses `useQuery(api.users.getUserStats)` instead of `loadState()`
- Automatically migrates localStorage data on first load
- Updates streak via Convex mutation

### 2. **Portfolio** (`src/pages/Portfolio.tsx`)
- Fetches user stats from Convex
- Displays real-time data from database

### 3. **ProjectWorkspace** (`src/pages/ProjectWorkspace.tsx`)
- Saves project completions to Convex
- Updates skills and badges via mutations
- Still maintains localStorage for backward compatibility

## Database Schema

### `userStats` Table
```typescript
{
  userId: Id<"users">,
  promptScore: number,
  previousPromptScore: number,
  rubric: { clarity, constraints, iteration, tool },
  skills: { generative_ai, agentic_ai, ... },
  previousSkills: { ... },
  badges: string[],
  completedProjects: [{
    slug: string,
    completedAt: string,
    finalScore: number,
    rubric: { ... },
    badgeEarned: boolean,
    skillsGained: string[]
  }],
  assessmentHistory: [{
    date: string,
    promptScore: number,
    skills: { ... },
    rubric: { ... }
  }],
  streak: number,
  lastActiveDate: number,
  assessmentComplete: boolean,
  unlockedCareers: string[],
  communityActivity: { ... }
}
```

## Convex Functions

### Queries
- `api.users.getUserStats` - Get user statistics
- `api.users.getUserProgress` - Get project progress

### Mutations
- `api.users.initializeUserStats` - Initialize stats for new user
- `api.users.updateAssessmentResults` - Update assessment scores
- `api.users.completeProject` - Mark project as completed
- `api.users.updateSkills` - Update user skills
- `api.users.updateStreak` - Update daily streak
- `api.users.addBadge` - Add badge to user

## Automatic Migration

The app automatically migrates localStorage data to Convex when a user logs in:

1. **Migration Hook** (`src/hooks/useUserStatsMigration.ts`)
   - Runs once per user session
   - Reads localStorage data
   - Saves to Convex
   - Clears localStorage after successful migration

2. **Migration Utility** (`src/lib/migrate-to-convex.ts`)
   - Handles the actual data transfer
   - Preserves all user progress
   - Logs migration status

## Testing the Migration

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Login with a user account**
   - Migration runs automatically
   - Check console for migration logs

3. **Verify data:**
   - Open Dashboard - should show your stats
   - Open Portfolio - should show completed projects
   - Complete a new project - should save to Convex

## Rollback Plan

If issues occur, the app still maintains localStorage as a backup:
- ProjectWorkspace saves to both Convex and localStorage
- Can temporarily revert components to use `loadState()` if needed

## Future Improvements

- [ ] Remove localStorage completely once migration is stable
- [ ] Add real-time sync indicators in UI
- [ ] Implement offline support with optimistic updates
- [ ] Add data export/import features
- [ ] Create admin dashboard for user stats
