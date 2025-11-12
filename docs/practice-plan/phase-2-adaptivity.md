# Phase 2 – Adaptivity & Content Scale (Weeks 5–8)

Goal: unlock personalized progression and infinite practice variety by layering the adaptive engine, parametric content system, and coach experience on top of the Phase 1 foundation.

## Key Deliverables

1. **Elo-Based Difficulty Engine**
   - Implement rating updates per item (`practiceItems.elo`) and per skill (`practiceUserSkills.rating`).
   - Picker service selects the next activity targeting weakest skill at +100 Elo.
   - Dynamic difficulty bands (foundation/core/challenge) adjust every 3–5 items.

2. **Item Templates & Scenario Bank v1**
   - Launch template authoring (schema + validation) for MC, prompt draft, prompt surgery, tool selection, drag/sort.
   - Seed ≥15 scenario shells per track using the outlines in `content-brief.md`.
   - Automation to expand templates into concrete `practiceItems` with initial Elo 1500.

3. **Coach Panel**
   - In-app guide summarizing recent performance, highlighting weak skills, and suggesting targeted activities.
   - Connect to review deck (spaced repetition) and adaptive picker API.

4. **Review Deck & Spaced Repetition**
   - Schedule missed or low-scored items via SM-2-esque algorithm stored in `practiceReviewDeck`.
   - Feed Daily Drills and Coach recommendations.

5. **Analytics & Telemetry**
   - Track per-item Elo convergence, step completion times, drop-offs, and conversion between difficulty bands.
   - Surface dashboards for content tuning.

## Workstreams

| Workstream   | Tasks                                                                    | Owners (TBD) |
| ------------ | ------------------------------------------------------------------------ | ------------ |
| Backend      | Implement ratings, picker, review deck scheduling, analytics pipeline.   |              |
| Content      | Build template library, author scenario shells, configure parameters.    |              |
| Frontend     | Coach panel UI, adaptive item loader, deck notifications.                |              |
| Data Science | Define Elo constants, monitor calibration quality, tune SM-2 parameters. |              |

## Success Criteria

- Adaptive picker online for ≥80% of practice sessions.
- Template system generates at least 5 variants per activity with <2% validation failures.
- Coach panel click-through ≥40% and recommended items completed ≥30%.
- Review deck delivers 3–5 daily items with on-time completion ≥60%.

## Dependencies

- Phase 1 schema tables migrated (tracks, projects, activities, items).
- Validation services for template generation (schema + safety checks).
- Analytics stack (Segment/Mixpanel) instrumentation in place.

## Hand-offs

- Publish author guidelines for template parameters and scenario shells.
- Provide API documentation for adaptive picker and coach components.
- Transfer monitoring dashboards to ops/analytics team for ongoing tuning.
