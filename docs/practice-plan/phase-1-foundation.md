# Phase 1 – Foundation & Core Value (Weeks 1–4)

Goal: convert the current prototype into a learner-ready experience by introducing real prompt drafting, backfilling missing content, calibrating entry points, and delivering habit loops that keep users practicing daily.

## Key Deliverables

1. **AI Review Integration**
   - Replace the existing `alert()` placeholder with live AI evaluation for prompt drafting and retro/improve steps.
   - Provider abstraction (OpenAI/Anthropic) with retry and cost logging.

2. **Project Upgrades**
   - Each legacy project gains at least one guided prompt draft and one retro/improve item.
   - Introduce the standard six-step flow (Warm-up → Anatomy → Guided Draft → Tool Choice → Applied Challenge → Retro).

3. **Scenario Backfill**
   - Resolve the 25-step scenario deficit flagged in the audit (`reports/practice-inventory-summary.json`).
   - Minimum 1:1 scenario-to-step coverage, no context reuse within a project run.

4. **Placement Test & Skill Map**
   - Launch a 12-item adaptive placement that seeds initial skill Elo values and unlocks the appropriate track.
   - Map rubric scores (clarity, constraints, iteration, tool) into skill ratings.

5. **Daily Drills & Streaks**
   - Ship a micro-practice surface (3–5 items) with streak logic, repair tokens, and recap messaging.
   - Surface in dashboard/home and via notifications.

6. **Schema Prep**
   - Begin introducing normalized tables from `schema-refactor.md` (tracks, projects, activities) behind a feature flag.
   - Migration scripts to mirror legacy data into the new model without breaking the current UI.

## Workstreams

| Workstream | Tasks | Owners (TBD) |
| --- | --- | --- |
| Content | Draft new guided/retro steps, author missing scenarios, QA explanations. | |
| Frontend | Update project workspace UI for new step types, integrate AI feedback. | |
| Backend | Implement AI evaluation service, placement test API, streak endpoints. | |
| Data | Generate initial skill ratings, track completion analytics. | |

## Success Criteria

- ≥70% of new users complete the placement test on day 1.
- ≥60% perform at least one text drafting task in their first session.
- All projects show 1 unique scenario per step (no gap in `scenarioCount`).
- Daily drills adopted by ≥40% of weekly active users with median drill time <4 minutes.

## Dependencies

- Provider access keys + quota for AI evaluation.
- Content team bandwidth for scenario authoring and QA.
- Feature flags to swap between legacy and new step sequencing.

## Hand-offs

- Document revised project specs in Notion / CMS.
- Provide updated convex seeding scripts to engineering.
- Archive legacy MC-only copies after validation window.

