# Phase 3 – Creator & Stickiness (Weeks 9–12)

Goal: open the platform to community-generated content, layer in competitive/cooperative loops, and launch social/viral mechanics that keep learners coming back.

## Key Deliverables

1. **Creator Studio Beta**
   - Implement Remix, Template Fill, and From Scratch flows per `creator-studio-spec.md`.
   - Auto QA pipeline (clarity, safety, rubric coverage) on submit.
   - Calibration queue leveraging `practiceCalibrationRuns` before public release.

2. **UGC Lifecycle & Moderation**
   - Draft → Pending → Calibrating → Published pipeline with moderator tooling.
   - Flag/resolve system using `practiceModerationFlags`.
   - Creator profiles with stats (published items, adoption, rating, remix count).

3. **Engagement Systems**
   - Asynchronous Duels using shared item sets and live scoring.
   - Weekly Quests + Season 1 (theme, badges, reward structure).
   - Share cards (before/after prompt wins) and referral boosts unlocking premium packs.

4. **Retention Analytics**
   - Track creator contribution funnel, UGC play volume, duel participation, quest completion.
   - Cohort reports on D7/D30 retention improvements post gamification.

5. **Mobile-Friendly Foundations**
   - Audit UI for responsiveness, prep Expo SDK 54 pathway for future mobile release.

## Workstreams

| Workstream | Tasks | Owners (TBD) |
| --- | --- | --- |
| Frontend | Build Studio UI, duel arena, quest/season surfaces, sharing UX. | |
| Backend | Draft/QA/calibration APIs, moderation endpoints, duel scoring, quest tracking. | |
| Community Ops | Define moderation guidelines, creator incentives, season narrative. | |
| Marketing | Launch referral program, social campaigns around share cards. | |

## Success Criteria

- ≥10% of active learners publish at least one draft; ≥3% reach public.
- ≥15% of weekly play volume comes from UGC by end of week 12.
- Duels adopted by ≥20% of active learners with repeat rate ≥50%.
- Referral-assisted signups ≥12%; D7 retention improves to ≥35%, D30 ≥20%.

## Dependencies

- Phase 2 adaptive engine and content templates in production.
- Moderation staffing or rotating reviewers for calibration queue.
- Legal/Trust review for sharing and referral incentives.

## Hand-offs

- Publish creator documentation (how-to guides, validation rules, best practices).
- Transfer moderation dashboards to community ops.
- Plan Season 2 roadmap using metrics gathered during beta.

