# Duel Lobby System - Live Friend Battles

## ✅ IMPLEMENTED (Nov 12, 2025)

The lobby system enables real-time friend duels with synchronized starts and live gameplay.

## How It Works

### 1. Create Duel with Invite
```
User clicks "Create Duel" → 
Duel created in "lobby" status →
User lands in lobby screen →
Gets shareable invite link
```

### 2. Friend Joins via Invite
```
Friend clicks invite link →
Auto-joins duel as opponent →
Both players see each other in lobby →
Lobby status updates in real-time
```

### 3. Ready Up & Countdown
```
Both players click "I'm Ready!" →
3...2...1...GO! countdown →
Duel status changes to "active" →
Both start playing simultaneously
```

### 4. Live Battle
```
Real-time score updates →
See opponent's progress →
Streak counters →
Live scoreboard
```

## Key Features

### Lobby Screen (`components/duels/DuelLobby.tsx`)
- **Split player cards** showing both participants
- **Copy invite link** button with one-click sharing
- **Ready status** indicators (green checkmark when ready)
- **Duel info** display (items, mode, estimated time)
- **Countdown animation** (3-2-1-GO!)
- **Real-time updates** via Convex reactive queries

### Backend Changes (`convex/duels.ts`)
- **New status**: `"lobby"` for waiting room
- **`inviteMode` parameter**: Creates duel in lobby state
- **`markReady` mutation**: Players mark themselves ready
- **Auto-start**: When both ready, status → "active"
- **`acceptDuel` with `viaInvite`**: Auto-join from invite link

### Schema Updates (`convex/schema.ts`)
- **`challengerReady`**: Boolean for challenger ready status
- **`opponentReady`**: Boolean for opponent ready status
- **`status`**: Now includes `"lobby"` state

### Page Integration (`app/(routes)/duels/[duelId]/page.tsx`)
- **Invite detection**: Checks `?invite=true` query param
- **Auto-join**: Automatically accepts duel when visiting invite link
- **Lobby routing**: Shows lobby component when status is "lobby"
- **Seamless transition**: Lobby → Countdown → Gameplay

## User Flow

### Creating & Inviting
1. Click "Create Duel" in Duel Arena
2. Select number of items (3, 5, or 10)
3. Click "Create Challenge"
4. **Lobby screen appears** with invite link
5. Click "Copy Link" button
6. Share link via Discord, WhatsApp, text, etc.

### Joining via Invite
1. Friend clicks invite link
2. **Auto-joins duel** (no extra clicks needed)
3. Lands in lobby, sees challenger
4. Both players visible in lobby

### Starting the Duel
1. Both players click "I'm Ready!"
2. **3...2...1...GO!** countdown appears
3. Full-screen countdown animation
4. Duel starts simultaneously for both
5. Live scoreboard shows real-time updates

## Technical Details

### Real-Time Sync
- **Convex queries are reactive** - no polling needed
- When opponent joins → lobby updates instantly
- When opponent marks ready → status updates instantly
- When both ready → countdown triggers for both
- During gameplay → scores update in real-time

### Invite Link Format
```
https://yourapp.com/duels/[duelId]?invite=true
```

### Status Flow
```
"lobby" → (both ready) → "active" → (both complete) → "completed"
```

### Edge Cases Handled
- Can't accept your own duel
- Can't join if already has opponent
- Can't join if not in lobby/open status
- Auto-submit on timeout
- Countdown syncs for both players

## What's Next (Future Enhancements)

### Short Term
- [ ] Friend list system (add friends by username)
- [ ] Direct challenge from friend list
- [ ] In-app notifications when challenged
- [ ] Lobby chat/emotes

### Medium Term
- [ ] Quick match (random opponent)
- [ ] Ranked mode with ELO
- [ ] Tournament brackets
- [ ] Spectator mode

### Long Term
- [ ] Voice chat in lobby
- [ ] Custom duel rules
- [ ] Team duels (2v2)
- [ ] Replay system

## Testing

### Test the Flow
1. Create a duel
2. Copy the invite link
3. Open in incognito/different browser
4. Log in as different user
5. Visit invite link
6. Both mark ready
7. Watch countdown
8. Play simultaneously

### What to Check
- ✅ Invite link copies correctly
- ✅ Opponent appears in lobby when joining
- ✅ Ready status updates for both players
- ✅ Countdown triggers when both ready
- ✅ Duel starts at same time for both
- ✅ Scores update in real-time during gameplay
- ✅ Victory screen shows correct winner

## Benefits

### For Users
- **Social**: Play with friends, not strangers
- **Fair**: Both start at exact same time
- **Exciting**: Countdown builds anticipation
- **Competitive**: See opponent's progress live
- **Easy**: One-click invite link sharing

### For Platform
- **Viral**: Invite links drive user acquisition
- **Engagement**: Live battles are more engaging
- **Retention**: Social features increase retention
- **Data**: Real-time gameplay provides rich analytics

## Code Locations

- **Lobby Component**: `components/duels/DuelLobby.tsx`
- **Backend Logic**: `convex/duels.ts`
- **Schema**: `convex/schema.ts`
- **Page Integration**: `app/(routes)/duels/[duelId]/page.tsx`
- **Arena Updates**: `components/duels/DuelArena.tsx`

---

**Bottom Line**: Duels are now actually fun to play with friends! The lobby system makes it feel like a real multiplayer game with synchronized starts and live competition. 🎮🔥
