# Phase 1 Deployment Checklist

## Pre-Deployment

- [ ] Review all phase documents in `docs/practice-plan/`
- [ ] Ensure you have API keys (OpenAI or Anthropic)
- [ ] Backup existing database (if applicable)
- [ ] Review cost estimates and set budget alerts

## Environment Setup

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- [ ] Set `AI_EVAL_PROVIDER=openai` (recommended for lower costs)
- [ ] Configure feature flags:
  - [ ] `ENABLE_AI_EVALUATION=true`
  - [ ] `ENABLE_PLACEMENT_TEST=true`
  - [ ] `ENABLE_DAILY_DRILLS=true`

## Schema Deployment

- [ ] Run `npx convex dev` to test locally
- [ ] Verify no TypeScript errors
- [ ] Run `npx convex deploy` to production
- [ ] Confirm schema deployed successfully in Convex dashboard

## Data Migration

- [ ] Navigate to Convex dashboard → Functions
- [ ] Run `migrations:runAllMigrations` (internal mutation)
- [ ] Verify in dashboard:
  - [ ] `practiceTracks` has 4 rows
  - [ ] `practiceItemTemplates` has 2+ rows
  - [ ] `practiceItems` has items (if legacy projects exist)

## Component Integration

- [ ] Import `PlacementTest` component
- [ ] Add to onboarding flow or dashboard
- [ ] Import `DailyDrill` component
- [ ] Add to home/dashboard page
- [ ] Test both components in development

## Testing

### Placement Test
- [ ] Create test user account
- [ ] Complete full 12-item placement test
- [ ] Verify skill ratings calculated
- [ ] Verify track recommendation shown
- [ ] Check `placementTests` table has entry
- [ ] Check `practiceUserSkills` table populated

### Daily Drills
- [ ] Click "Start Today's Drill"
- [ ] Complete 3-5 items
- [ ] Verify streak increments
- [ ] Check completion celebration shows
- [ ] Verify `practiceDailyDrills` table updated
- [ ] Verify `practiceStreaks` table updated

### AI Evaluation
- [ ] Complete a prompt-draft item
- [ ] Verify AI feedback appears
- [ ] Check `aiEvaluationLogs` table for entry
- [ ] Verify cost is logged
- [ ] Check latency is acceptable (<3s)

## Monitoring Setup

- [ ] Set up alerts for:
  - [ ] AI evaluation failures (>5% error rate)
  - [ ] High latency (>5s average)
  - [ ] Daily cost exceeds budget
  - [ ] Low placement completion rate (<50%)

- [ ] Create dashboards for:
  - [ ] Daily active users
  - [ ] Placement test completion rate
  - [ ] Daily drill adoption rate
  - [ ] Average streak length
  - [ ] AI evaluation costs

## Performance Validation

- [ ] Test with 10 concurrent users
- [ ] Verify AI evaluation doesn't timeout
- [ ] Check database query performance
- [ ] Monitor memory usage
- [ ] Test on mobile devices

## Rollout Strategy

### Week 1: Soft Launch (10% of users)
- [ ] Enable for beta testers only
- [ ] Monitor metrics daily
- [ ] Gather qualitative feedback
- [ ] Fix critical bugs

### Week 2: Gradual Rollout (50% of users)
- [ ] Enable for half of user base
- [ ] Monitor cost vs. budget
- [ ] Track engagement metrics
- [ ] Optimize based on data

### Week 3: Full Rollout (100% of users)
- [ ] Enable for all users
- [ ] Announce new features
- [ ] Monitor at scale
- [ ] Plan Phase 2 based on learnings

## Success Metrics (Week 4)

Target metrics from phase plan:
- [ ] ≥70% of new users complete placement test on day 1
- [ ] ≥60% perform text drafting in first session
- [ ] ≥40% of WAU adopt daily drills
- [ ] Median drill time <4 minutes
- [ ] AI evaluation success rate >95%

## Troubleshooting

### If placement test doesn't load:
1. Check `practiceItems` table has items
2. Run migrations if needed
3. Verify items have `status: "live"`

### If AI evaluation fails:
1. Check API key is valid
2. Verify provider is set correctly
3. Check rate limits not exceeded
4. Review `aiEvaluationLogs` for errors

### If daily drills are empty:
1. Verify user completed placement test
2. Check `practiceUserSkills` table populated
3. Ensure `practiceItems` exist

### If costs are too high:
1. Switch to OpenAI if using Anthropic
2. Reduce evaluation frequency
3. Cache common evaluations
4. Batch process evaluations

## Post-Deployment

- [ ] Monitor for 48 hours continuously
- [ ] Review all error logs
- [ ] Analyze user feedback
- [ ] Document lessons learned
- [ ] Plan content backfill (25-step deficit)
- [ ] Begin Phase 2 planning

## Rollback Plan

If critical issues arise:
1. Set feature flags to `false` in environment
2. Redeploy without new components
3. Keep schema (backward compatible)
4. Investigate and fix issues
5. Re-enable gradually

## Documentation

- [ ] Update internal wiki with new features
- [ ] Create user-facing help docs
- [ ] Document API endpoints for team
- [ ] Share metrics dashboard access
- [ ] Schedule Phase 1 retrospective

## Next Steps

After successful Phase 1 deployment:
1. **Content Backfill** - Resolve 25-step scenario deficit
2. **Phase 2 Planning** - Adaptive engine and parametric content
3. **User Research** - Gather feedback on new features
4. **Cost Optimization** - Fine-tune AI evaluation usage

---

## Quick Commands

```bash
# Deploy schema
npx convex deploy

# Run migrations (via dashboard or CLI)
npx convex run migrations:runAllMigrations --prod

# Check logs
npx convex logs --prod

# Monitor costs
# Check aiEvaluationLogs table in dashboard
```

## Support Contacts

- Technical Issues: [Your team contact]
- Cost/Billing: [Finance contact]
- User Feedback: [Product contact]

---

**Last Updated:** Phase 1 Implementation Complete
**Status:** Ready for Deployment ✅
