# Retention Strategy

> **Purpose:** Engagement playbook for reducing churn and building long-term user habits.

---

## Current Retention Mechanisms

### 🔥 Streak System

**What it does:** Rewards consecutive days of practice  
**Driver:** Loss aversion + visible progress  
**Current State:** ✅ Implemented

### 🌀 Spiral AI Companion

**What it does:** Non-judgmental AI buddy that guides and encourages  
**Driver:** Emotional connection + immediate help when stuck  
**Current State:** ✅ Implemented

### 🎯 Gamification (Points, Levels)

**What it does:** Visible progress through XP and level-ups  
**Driver:** Achievement motivation + status  
**Current State:** ✅ Implemented

---

## Gaps Identified (From Beta Reviews)

> [!WARNING]
> **Critical Retention Gaps**
>
> - ❌ No Day 3 re-engagement (when most users drop off)
> - ❌ No weekly anchor habit (Mondays have no pull)
> - ❌ No 7-day inactivity response (silent churn)
> - ❌ No "aha moment" tracking (don't know when users click)

---

## Recommended Additions

### 1️⃣ Day 3 Hook — "First Milestone Push"

**Why Day 3:** Data shows Day 2-3 is the critical drop-off point. Users who make it past Day 3 are 5x more likely to become long-term users.

**Implementation:**

| Channel | Timing        | Message                                             |
| ------- | ------------- | --------------------------------------------------- |
| Email   | Day 3, 10am   | "You're 2 days away from your first badge!"         |
| Push    | Day 3, 6pm    | "Your streak is growing 🔥 Keep it up!"             |
| In-app  | On next login | Show progress bar to first milestone (80% complete) |

**Design Principles:**

- Focus on proximity to reward, not punishment for absence
- Show concrete progress bar, not abstract encouragement
- Use Spiral's voice for personality

**Metrics to Track:**

- Day 3 return rate (before/after)
- First badge completion rate

---

### 2️⃣ Weekly Anchor — "Monday Challenges"

**Why Weekly:** Creates a recurring reason to return beyond daily streaks. Gives lapsed users a natural re-entry point.

**Implementation:**

| Feature               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| **Weekly Challenge**  | New special challenge every Monday                     |
| **Leaderboard Reset** | Weekly rankings create weekly mini-competitions        |
| **Monday Email**      | "This week's challenge is live" + teaser               |
| **Limited Rewards**   | Weekly-exclusive badge for completing Monday challenge |

**Challenge Ideas:**

- "This week: Prompt an AI to explain quantum computing to a 5-year-old"
- "This week: Create a social media strategy using only prompts"
- "This week: Speed run—complete 5 challenges in under 10 minutes"

**Metrics to Track:**

- Monday DAU vs other weekdays
- Weekly challenge participation rate
- Lapsed user reactivation (users returning after 5+ day gap)

---

### 3️⃣ 7-Day Inactivity Nudge — "We Miss You"

**Why Day 7:** Early enough that the platform isn't forgotten, late enough that it's not annoying.

**Implementation:**

| Channel | Message                                                         | CTA              |
| ------- | --------------------------------------------------------------- | ---------------- |
| Email   | "Your streak is waiting 🔥 We saved your spot"                  | "Jump back in"   |
| Push    | "Spiral misses you! New challenges dropped while you were away" | "See what's new" |

**Email Content:**

- Show what they're missing (new challenges, community posts)
- Highlight lowest-friction activity ("5 minutes to reignite your streak")
- Personal touch from Spiral
- Clear, single CTA

**Do NOT:**

- Guilt trip ("You've missed X days!")
- Overwhelm with everything new
- Send multiple follow-ups in quick succession

**Metrics to Track:**

- 7-day reactivation rate
- Email open/click rates
- Users who return after nudge

---

### 4️⃣ Aha Moment Tracking (Future)

**Why:** We don't currently know _what_ makes a user "click" and become engaged. This data would optimize everything.

**Proposed Aha Moments to Test:**

1. First Prompt Score over 80
2. First badge earned
3. First streak of 3 days
4. First Spiral interaction
5. First time viewing Matching Zone

**Implementation:**

- Track each event in analytics
- Correlate with 30-day retention
- Identify which moment is strongest predictor
- Optimize onboarding to reach that moment faster

---

## Retention Lifecycle Map

```
Day 0: Sign up → Assessment → First challenge (immediate value)
       ↓
Day 1: Reminder to continue → Second challenge → Streak begins
       ↓
Day 2: Progress email → "You're on fire 🔥"
       ↓
Day 3: CRITICAL — First badge proximity push
       ↓
Day 7: First badge earned (for retained users)
       ↓
Day 7: Nudge email (for lapsed users)
       ↓
Week 2+: Weekly challenges + leaderboard resets
       ↓
Month 1: First certificate milestone
       ↓
Ongoing: Career matching notifications, new content drops
```

---

## Notification Cadence Rules

> [!IMPORTANT]
> **Anti-Annoyance Guardrails**
>
> - Max 1 push notification per day
> - Max 3 emails per week
> - Quiet mode respected (user opt-out)
> - Time zone aware (no 3am pushes)
> - Test all messages with actual users first

---

## Quick Wins (Implement First)

| Priority  | Feature                 | Effort                | Impact                          |
| --------- | ----------------------- | --------------------- | ------------------------------- |
| 🟢 High   | Day 3 email             | Low (1 email)         | High (critical moment)          |
| 🟢 High   | 7-day inactivity email  | Low (1 email)         | Medium (recovers churned users) |
| 🟡 Medium | Monday challenge system | Medium (new feature)  | High (weekly anchor)            |
| 🟡 Medium | Leaderboard reset       | Low (config change)   | Medium (weekly cycle)           |
| 🔴 Low    | Aha moment tracking     | High (analytics work) | High (long-term optimization)   |

---

## Success Metrics

| Metric              | Current | Target           | How to Measure              |
| ------------------- | ------- | ---------------- | --------------------------- |
| Day 3 retention     | TBD     | 60%+             | Users returning on Day 3    |
| Day 7 retention     | TBD     | 40%+             | Users returning on Day 7    |
| Day 30 retention    | TBD     | 25%+             | Users returning on Day 30   |
| Streak average      | TBD     | 7+ days          | Average streak length       |
| Weekly active users | TBD     | Growing 10%+ MoM | Users active 1+ times/week  |
| Reactivation rate   | TBD     | 15%+             | Lapsed users (7d) returning |

---

## Next Steps

1. [ ] Implement Day 3 email sequence
2. [ ] Implement 7-day inactivity email
3. [ ] Set up retention analytics dashboard
4. [ ] Design Monday Challenge system
5. [ ] A/B test messaging approaches
6. [ ] Establish baseline metrics
