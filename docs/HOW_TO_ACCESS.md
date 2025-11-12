# How to Access New Features

## Quick Access Guide

All Phase 2 and Phase 3 features are now accessible through the sidebar navigation!

### 🎯 Phase 2 Features (Adaptive Learning)

#### Coach Panel
- **Location**: Dashboard (right sidebar)
- **URL**: Automatically shown on `/dashboard`
- **What it does**: 
  - Shows your weakest skills
  - Recommends targeted practice
  - Displays review deck status
  - Tracks skill ratings

### 🎮 Phase 3 Features (Engagement & Creator Tools)

#### 1. Duels (Competitive Play)
- **Location**: Sidebar → Engagement → Duels
- **URL**: `/duels`
- **What you can do**:
  - Create new duels (5 random items)
  - Accept open challenges
  - View active duels
  - Check completed duels
  - See win/loss statistics

#### 2. Quests (Challenges)
- **Location**: Sidebar → Engagement → Quests
- **URL**: `/quests`
- **What you can do**:
  - View available quests
  - Start quests
  - Track progress automatically
  - Claim rewards (XP, badges, unlocks)
  - See leaderboards

#### 3. Creator Studio
- **Location**: Sidebar → Engagement → Creator Studio
- **URL**: `/creator`
- **What you can do**:
  - View creator stats
  - Create content via 3 methods:
    - **Remix Existing**: Clone and customize
    - **Template Fill**: Guided creation
    - **From Scratch**: Advanced editor
  - Manage drafts
  - Submit for review
  - Track published content

## Navigation Structure

```
Sidebar
├── Main
│   ├── Dashboard (with Coach Panel)
│   ├── Practice Zone
│   ├── Matching Zone
│   ├── AI Database
│   └── Portfolio
├── Engagement (NEW!)
│   ├── Duels
│   ├── Quests
│   └── Creator Studio
├── Community
│   ├── Leaderboard
│   └── Community
└── AI Tools
    ├── Custom GPTs
    └── AI Platform
```

## First Time Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Start Convex Backend
```bash
npx convex dev
```

### 3. Access the App
Open your browser to `http://localhost:3000`

### 4. Navigate to New Features
- Click on the sidebar menu
- Look for the "Engagement" section
- Click on any of the new features

## Testing the Features

### Test Duels
1. Go to `/duels`
2. Click "Create Duel"
3. System will select 5 random practice items
4. You can accept your own duel or wait for others

### Test Quests
1. Go to `/quests`
2. View available quests
3. Click "Start Quest" on any quest
4. Complete practice items to make progress
5. Return to claim rewards when complete

### Test Creator Studio
1. Go to `/creator`
2. View your creator stats (starts at Level 1)
3. Click one of the creation methods
4. Create a draft (validation will run automatically)
5. Submit for review when ready

### Test Coach Panel
1. Go to `/dashboard`
2. Look at the right sidebar
3. Coach Panel shows:
   - Your weakest skill
   - Items due for review
   - Skill ratings with trends

## API Endpoints (for testing in Convex Dashboard)

### Duels
```javascript
// Create duel
api.duels.createDuel({ itemCount: 5 })

// Get user's duels
api.duels.getUserDuels({})

// Get open duels
api.duels.getOpenDuels({ limit: 10 })
```

### Quests
```javascript
// Get active quests
api.quests.getActiveQuests({})

// Start quest
api.quests.startQuest({ questId: "..." })

// Get user's quests
api.quests.getUserQuests({})
```

### Creator Studio
```javascript
// Get creator profile
api.creatorStudio.getCreatorProfile({})

// Get user's drafts
api.creatorStudio.getUserDrafts({})

// Create draft
api.creatorStudio.createDraft({
  type: "item",
  title: "Test Item",
  description: "This is a test item",
  content: {},
  metadata: { skills: ["test"], tags: [] }
})
```

### Adaptive Engine (Phase 2)
```javascript
// Get user's skill ratings
api.adaptiveEngine.getUserSkillRatings({ userId: "..." })

// Get weakest skill
api.adaptiveEngine.getWeakestSkill({ userId: "..." })

// Pick next item
api.adaptiveEngine.pickNextItem({ userId: "..." })
```

### Spaced Repetition (Phase 2)
```javascript
// Get due reviews
api.spacedRepetition.getDueReviews({ userId: "..." })

// Get review stats
api.spacedRepetition.getReviewStats({ userId: "..." })
```

## Troubleshooting

### Features not showing in sidebar?
- Make sure you've restarted the dev server
- Check that `components/AppSidebar.tsx` has been updated
- Clear browser cache and reload

### Convex functions not working?
- Ensure `npx convex dev` is running
- Check Convex dashboard for errors
- Verify all new files are deployed

### Coach Panel not showing?
- Make sure you're logged in
- Check that user ID exists
- Look for errors in browser console

### Pages showing errors?
- Run `npm install` to ensure all dependencies
- Check that all component imports are correct
- Verify Convex schema is deployed

## What's Next?

### Immediate Next Steps
1. **Create Test Data**: Use Convex dashboard to create sample quests
2. **Test Duels**: Create and complete a duel
3. **Try Creator Studio**: Make a draft and submit it
4. **Check Coach Panel**: Complete some practice items to see recommendations

### Future Enhancements
- Build full editor pages for Creator Studio
- Add moderator dashboard
- Create quest UI with better progress tracking
- Design share card templates
- Launch Season 1 with themed quests

## Resources

- [Phase 2 Implementation](./PHASE_2_IMPLEMENTATION.md)
- [Phase 2 Quick Start](./PHASE_2_QUICK_START.md)
- [Phase 3 Implementation](./PHASE_3_IMPLEMENTATION.md)
- [Phase 3 Quick Start](./PHASE_3_QUICK_START.md)
- [Convex Documentation](https://docs.convex.dev)
