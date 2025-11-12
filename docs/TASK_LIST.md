# Task List - Remaining Work

**Track Progress:** Update checkboxes as tasks are completed
**Priority:** 🔴 Critical | 🟡 Important | 🟢 Nice to Have

---

## 🔴 CRITICAL TASKS (Make Features Usable)

### Task 1: Duel Gameplay Page
**Priority:** 🔴 Critical
**Status:** ✅ Complete
**Estimated Time:** 2-3 hours
**Blocks:** Duels feature completely unusable without this

**Requirements:**
- [x] Create `/app/(routes)/duels/[duelId]/page.tsx`
- [x] Fetch duel details and items
- [x] Display practice items one by one
- [x] Handle user responses
- [x] Submit duel attempts via `submitDuelAttempt`
- [x] Show score after each item
- [x] Show opponent progress (if available)
- [x] Navigate back to arena when complete
- [x] Handle duel completion (show winner)

**Files Created:**
- `app/(routes)/duels/[duelId]/page.tsx` ✅
- `components/duels/DuelGameplay.tsx` ✅

**Dependencies:**
- Practice item display components ✅
- Duel attempt submission logic ✅

---

### Task 2: Wire Quest Progress to Practice
**Priority:** 🔴 Critical
**Status:** ✅ COMPLETE
**Estimated Time:** 1-2 hours
**Blocks:** Quest progress never updates

**Requirements:**
- [x] Find practice item completion handler
- [x] Call `updateQuestProgress` after completion
- [x] Map completion events to quest requirements:
  - [x] `item_completed` → complete_items
  - [x] `skill_practiced` → practice_skill
  - [x] `score_earned` → earn_score
  - [ ] `daily_practice` → daily_streak (needs separate tracking)
- [x] Test quest progress updates
- [ ] Add visual feedback when quest progresses (future enhancement)

**Files to Modify:**
- Practice item completion handler (find it)
- Possibly `convex/practiceProjects.ts` or similar

**Dependencies:**
- Understanding current practice flow
- Quest event system

---

### Task 3: Template Fill Editor (Simplest Creator Path)
**Priority:** 🔴 Critical
**Status:** ✅ COMPLETE
**Estimated Time:** 3-4 hours
**Blocks:** Creator Studio completely unusable

**Requirements:**
- [x] Create `/app/(routes)/creator/template/page.tsx`
- [x] List available templates
- [x] Create multi-step form for template parameters
- [x] Show live validation errors
- [x] Preview panel (review step)
- [x] Save as draft
- [x] Submit for review
- [x] Handle success/error states

**Files to Create:**
- `app/(routes)/creator/template/page.tsx`
- `components/creator/TemplateSelector.tsx`
- `components/creator/TemplateForm.tsx`
- `components/creator/ValidationDisplay.tsx`

**Dependencies:**
- Template definitions
- Draft creation API

---

### Task 4: Review Session Page
**Priority:** 🔴 Critical
**Status:** ✅ COMPLETE
**Estimated Time:** 2-3 hours
**Blocks:** Spaced repetition unusable

**Requirements:**
- [x] Create `/app/(routes)/practice/review/page.tsx`
- [x] Fetch due review items via `getDueReviews`
- [x] Display items one by one
- [x] Collect user responses
- [x] Rate recall quality (0-5 buttons)
- [x] Update review deck via `addToReviewDeck`
- [x] Show progress (X of Y reviewed)
- [x] Completion screen with stats

**Files to Create:**
- `app/(routes)/practice/review/page.tsx`
- `components/practice/ReviewSession.tsx`
- `components/practice/QualityRating.tsx`

**Dependencies:**
- Practice item display
- Review deck API

---

## 🟡 IMPORTANT TASKS (Complete Core Features)

### Task 5: Draft Editor Page
**Priority:** 🟡 Important
**Status:** ❌ Not Started
**Estimated Time:** 4-5 hours

**Requirements:**
- [ ] Create `/app/(routes)/creator/edit/[draftId]/page.tsx`
- [ ] Load draft data
- [ ] Editable form fields
- [ ] Live validation display
- [ ] Auto-save functionality
- [ ] Preview panel
- [ ] Submit button
- [ ] Delete draft option

**Files to Create:**
- `app/(routes)/creator/edit/[draftId]/page.tsx`
- `components/creator/DraftEditor.tsx`

---

### Task 6: Wire Adaptive Engine to Practice
**Priority:** 🟡 Important
**Status:** ❌ Not Started
**Estimated Time:** 2-3 hours

**Requirements:**
- [ ] After item completion, call `updateSkillRating`
- [ ] After item completion, call `updateItemElo`
- [ ] Add items to review deck if score < 80%
- [ ] Use `pickNextItem` in practice flow
- [ ] Show difficulty band on items
- [ ] Display Elo rating (optional)

**Files to Modify:**
- Practice completion handler
- Practice item selector

---

### Task 7: Integrate Spaced Repetition
**Priority:** 🟡 Important
**Status:** ❌ Not Started
**Estimated Time:** 2 hours

**Requirements:**
- [ ] Add struggling items to review deck automatically
- [ ] Show "Review Due" notification
- [ ] Link to review page from Coach Panel
- [ ] Track review completion in stats

**Files to Modify:**
- Practice completion handler
- Coach Panel (already has review stats)

---

### Task 8: Moderator Dashboard
**Priority:** 🟡 Important
**Status:** ❌ Not Started
**Estimated Time:** 3-4 hours

**Requirements:**
- [ ] Create `/app/(routes)/moderator/page.tsx`
- [ ] Show pending drafts via `getPendingDrafts`
- [ ] Show pending flags via `getPendingFlags`
- [ ] Approve/reject buttons
- [ ] Flag resolution interface
- [ ] Moderator role check
- [ ] Stats dashboard

**Files to Create:**
- `app/(routes)/moderator/page.tsx`
- `components/moderation/ModeratorQueue.tsx`
- `components/moderation/DraftReview.tsx`

---

## 🟢 NICE TO HAVE TASKS (Polish & Enhancement)

### Task 9: Remix Editor
**Priority:** 🟢 Nice to Have
**Status:** ❌ Not Started
**Estimated Time:** 4-5 hours

**Requirements:**
- [ ] Create `/app/(routes)/creator/remix/page.tsx`
- [ ] Browse existing content
- [ ] Search and filter
- [ ] Select item to remix
- [ ] Clone to draft
- [ ] Show diff from original
- [ ] Edit and save

**Files to Create:**
- `app/(routes)/creator/remix/page.tsx`
- `components/creator/ContentBrowser.tsx`
- `components/creator/RemixEditor.tsx`

---

### Task 10: From Scratch Editor
**Priority:** 🟢 Nice to Have
**Status:** ❌ Not Started
**Estimated Time:** 5-6 hours

**Requirements:**
- [ ] Create `/app/(routes)/creator/scratch/page.tsx`
- [ ] YAML/JSON editor with syntax highlighting
- [ ] Schema hints and autocomplete
- [ ] Live validation
- [ ] Preview panel
- [ ] Save and submit

**Files to Create:**
- `app/(routes)/creator/scratch/page.tsx`
- `components/creator/CodeEditor.tsx`

---

### Task 11: Quest Detail Page
**Priority:** 🟢 Nice to Have
**Status:** ❌ Not Started
**Estimated Time:** 2-3 hours

**Requirements:**
- [ ] Create `/app/(routes)/quests/[questId]/page.tsx`
- [ ] Show quest details
- [ ] Show leaderboard via `getQuestLeaderboard`
- [ ] Show user's progress
- [ ] Show rewards
- [ ] Start/claim buttons

**Files to Create:**
- `app/(routes)/quests/[questId]/page.tsx`
- `components/quests/QuestDetail.tsx`
- `components/quests/Leaderboard.tsx`

---

### Task 12: Share Card UI
**Priority:** 🟢 Nice to Have
**Status:** ❌ Not Started
**Estimated Time:** 3-4 hours

**Requirements:**
- [ ] Create `/app/(routes)/share/[cardId]/page.tsx`
- [ ] Design share card templates
- [ ] Generate card images
- [ ] Social media meta tags
- [ ] Share buttons (Twitter, LinkedIn, etc.)
- [ ] View tracking

**Files to Create:**
- `app/(routes)/share/[cardId]/page.tsx`
- `components/sharing/ShareCard.tsx`
- `components/sharing/ShareButtons.tsx`

---

### Task 13: Referral Page
**Priority:** 🟢 Nice to Have
**Status:** ❌ Not Started
**Estimated Time:** 2-3 hours

**Requirements:**
- [ ] Create `/app/(routes)/referral/page.tsx`
- [ ] Show user's referral code
- [ ] Copy to clipboard button
- [ ] Show referral stats
- [ ] Show rewards earned
- [ ] Apply referral code form

**Files to Create:**
- `app/(routes)/referral/page.tsx`
- `components/sharing/ReferralDashboard.tsx`

---

### Task 14: Analytics Dashboard
**Priority:** 🟢 Nice to Have
**Status:** ❌ Not Started
**Estimated Time:** 4-5 hours

**Requirements:**
- [ ] Create `/app/(routes)/admin/analytics/page.tsx`
- [ ] Elo convergence charts
- [ ] Completion time graphs
- [ ] Drop-off funnels
- [ ] AI cost tracking
- [ ] User engagement metrics
- [ ] Admin role check

**Files to Create:**
- `app/(routes)/admin/analytics/page.tsx`
- `components/analytics/ConvergenceChart.tsx`
- `components/analytics/CostTracker.tsx`

---

### Task 15: Seasons System
**Priority:** 🟢 Nice to Have
**Status:** ❌ Not Started
**Estimated Time:** 3-4 hours

**Requirements:**
- [ ] Create season management UI
- [ ] Season landing page
- [ ] Season leaderboard
- [ ] Season rewards
- [ ] Season progression tracking

**Files to Create:**
- `app/(routes)/seasons/page.tsx`
- `app/(routes)/seasons/[seasonId]/page.tsx`
- `components/seasons/SeasonCard.tsx`

---

## 🔧 TECHNICAL DEBT & IMPROVEMENTS

### Task 16: Seed More Sample Data
**Priority:** 🟡 Important
**Status:** ⚠️ Partial (quests only)
**Estimated Time:** 1-2 hours

**Requirements:**
- [x] Sample quests (done)
- [ ] Sample practice items
- [ ] Sample templates
- [ ] Sample scenarios
- [ ] Sample duels (for testing)

**Files to Modify:**
- `convex/seedPhase3.ts`

---

### Task 17: Error Handling & Loading States
**Priority:** 🟡 Important
**Status:** ⚠️ Partial
**Estimated Time:** 2-3 hours

**Requirements:**
- [ ] Better error messages
- [ ] Retry logic
- [ ] Skeleton loaders everywhere
- [ ] Empty states
- [ ] Error boundaries

---

### Task 18: Testing
**Priority:** 🟡 Important
**Status:** ❌ Not Started
**Estimated Time:** Ongoing

**Requirements:**
- [ ] Unit tests for Elo calculations
- [ ] Unit tests for SM-2 algorithm
- [ ] Integration tests for quest progress
- [ ] E2E tests for duel flow
- [ ] E2E tests for creator flow

---

### Task 19: Mobile Optimization
**Priority:** 🟢 Nice to Have
**Status:** ⚠️ Partial (responsive CSS exists)
**Estimated Time:** 3-4 hours

**Requirements:**
- [ ] Test all pages on mobile
- [ ] Fix layout issues
- [ ] Touch-friendly interactions
- [ ] Mobile navigation
- [ ] Performance optimization

---

### Task 20: Documentation
**Priority:** 🟢 Nice to Have
**Status:** ⚠️ Partial
**Estimated Time:** 2-3 hours

**Requirements:**
- [x] Implementation status (done)
- [x] Task list (this file)
- [ ] API documentation
- [ ] Component documentation
- [ ] Integration guides
- [ ] Testing guides
- [ ] Deployment guide

---

## 📊 Progress Tracking

### By Priority
- 🔴 Critical: 1/4 complete (25%)
- 🟡 Important: 0/5 complete (0%)
- 🟢 Nice to Have: 0/11 complete (0%)

### By Category
- **Duels:** 1/2 complete (50%)
- **Quests:** 0/2 complete (0%)
- **Creator Studio:** 0/4 complete (0%)
- **Adaptive/Review:** 0/3 complete (0%)
- **Moderation:** 0/1 complete (0%)
- **Sharing:** 0/2 complete (0%)
- **Polish:** 0/6 complete (0%)

### Overall Progress
**Total Tasks:** 20
**Completed:** 1
**In Progress:** 0
**Not Started:** 19
**Progress:** 5%

---

## 🎯 Recommended Order

### Week 1: Make It Usable
1. Task 1: Duel Gameplay Page (🔴)
2. Task 2: Wire Quest Progress (🔴)
3. Task 3: Template Fill Editor (🔴)
4. Task 4: Review Session Page (🔴)

**Result:** All 3 main features become usable

### Week 2: Complete Core
5. Task 5: Draft Editor (🟡)
6. Task 6: Wire Adaptive Engine (🟡)
7. Task 7: Integrate Spaced Repetition (🟡)
8. Task 8: Moderator Dashboard (🟡)

**Result:** Full feature set working

### Week 3: Polish
9. Task 16: Seed More Data (🟡)
10. Task 17: Error Handling (🟡)
11. Task 11: Quest Detail Page (🟢)
12. Task 12: Share Card UI (🟢)

**Result:** Production-ready quality

### Week 4+: Enhancements
13. Task 9: Remix Editor (🟢)
14. Task 10: From Scratch Editor (🟢)
15. Task 13-20: Other nice-to-haves

**Result:** Full feature parity with spec

---

## 📝 Notes

- Update this file as tasks are completed
- Add new tasks as they're discovered
- Adjust time estimates based on actual work
- Mark blockers and dependencies
- Celebrate wins! 🎉

**Last Updated:** Initial creation after Phase 2 & 3 backend implementation
