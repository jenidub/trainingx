# Practice Zone Components

Modular components for the Practice Zone feature.

## Structure

```
components/practice/
├── index.ts                 # Barrel export file
├── types.ts                 # TypeScript type definitions
├── utils.ts                 # Utility functions (level labels, gradients, etc.)
├── usePracticeData.ts       # Hook for transforming and managing practice data
├── useUnlockLogic.ts        # Hook for unlock logic with memoization
├── LoadingState.tsx         # Loading spinner component
├── StatsCards.tsx           # User statistics cards (4-card grid)
├── LevelSection.tsx         # Complete level section with projects
├── LevelHeader.tsx          # Level header with progress bar
└── ProjectCard.tsx          # Individual project card with unlock logic
```

## Key Features

- **Modular Design**: Each component has a single responsibility
- **Type Safety**: Centralized type definitions in `types.ts`
- **Performance**: Memoized unlock logic to prevent unnecessary recalculations
- **Reusability**: Components can be used independently or composed together

## Usage

```tsx
import {
  LevelSection,
  StatsCards,
  LoadingState,
  usePracticeData,
  useUnlockLogic,
} from "@/components/practice";

// In your page component
const { projects, stats, completedSlugs, levels, getLevelProgress } =
  usePracticeData(pageData?.projects, pageData?.userStats);

const { isLevelUnlocked, isProjectUnlocked } = useUnlockLogic(
  projects,
  completedSlugs,
  stats.promptScore
);
```

## Components

### StatsCards
Displays user statistics in a 4-card grid:
- Prompt Score
- Challenges Complete
- Badges Earned
- Weekly Minutes

### LevelSection
Renders a complete level section including:
- Level header with progress
- Lock/unlock indicator
- Grid of project cards

### ProjectCard
Individual project card with:
- Lock/unlock status
- Badge rewards
- Skill tags
- Action buttons (Start/Retake/Result)

## Hooks

### usePracticeData
Transforms raw Convex data into typed practice data with computed values.

**Returns:**
- `projects`: Transformed project array
- `stats`: User statistics
- `completedSlugs`: Set of completed project slugs
- `levels`: Sorted array of unique levels
- `getLevelProgress`: Function to calculate level progress

### useUnlockLogic
Memoized unlock logic for levels and projects.

**Returns:**
- `isLevelUnlocked`: Function to check if a level is unlocked
- `isProjectUnlocked`: Function to check if a project is unlocked

## Utilities

### levelLabel(level: number)
Returns human-readable level label (Beginner/Intermediate/Advanced).

### levelGradient(level: number)
Returns Tailwind gradient classes for level styling.

### getUnlockPromptScore(level: number, difficulty: number)
Calculates required prompt score to unlock a project.
