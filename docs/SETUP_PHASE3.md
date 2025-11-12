# Phase 3 Setup Guide

## Quick Setup (Run Once)

After starting your servers, you need to initialize some data:

### 1. Open Convex Dashboard
```bash
# In your terminal
npx convex dashboard
```

### 2. Run These Commands in the Dashboard

Go to the "Functions" tab and run:

#### Initialize Your Creator Profile
```javascript
api.seedPhase3.initializeUserForPhase3({})
```

#### Create Sample Quests
```javascript
api.seedPhase3.createSampleQuests({})
```

That's it! Now refresh your app and you should see:
- ✅ Creator Studio with your profile
- ✅ Duels with stats (0 duels initially)
- ✅ Quests with 3 sample quests

## What Each Function Does

### `initializeUserForPhase3`
- Creates your creator profile
- Sets you to Level 1
- Initializes stats to 0

### `createSampleQuests`
Creates 3 quests:
1. **Weekly Warrior** - Complete 10 practice items
2. **Daily Practice** - Practice 3 days in a row
3. **Communication Master** - Practice communication 5 times

## Troubleshooting

### Still seeing skeleton/loading?
- Make sure you're logged in
- Check browser console for errors
- Verify Convex functions ran successfully

### "Please log in" message?
- You need to be authenticated
- Go to `/auth` and sign in

### Quests not showing?
- Run `createSampleQuests` in Convex dashboard
- Refresh the page

### Creator Studio not loading?
- Run `initializeUserForPhase3` in Convex dashboard
- Make sure you're logged in

## Manual Testing

### Test Duels
```javascript
// In Convex dashboard
api.duels.createDuel({ itemCount: 5 })
```

### Test Quest Progress
```javascript
// Start a quest first in the UI, then:
api.quests.updateQuestProgress({
  userId: "YOUR_USER_ID",
  eventType: "item_completed",
  eventData: {}
})
```

### Create a Draft
```javascript
api.creatorStudio.createDraft({
  type: "item",
  title: "My First Item",
  description: "This is a test item to see if creator studio works properly",
  content: {
    itemType: "multiple-choice",
    question: "What is AI?",
    options: [
      { text: "Artificial Intelligence", quality: "good" },
      { text: "Alien Intelligence", quality: "bad" }
    ]
  },
  metadata: {
    skills: ["communication"],
    tags: ["test"],
    difficulty: "core",
    estimatedTime: 120
  }
})
```

## Next Steps

Once setup is complete:
1. Go to `/quests` and start a quest
2. Go to `/duels` and create a duel
3. Go to `/creator` and create a draft
4. Check `/dashboard` to see the Coach Panel

Enjoy! 🚀
