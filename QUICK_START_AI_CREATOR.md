# Quick Start: AI-Powered Creator Studio

## Setup (One-Time)

1. **Add OpenAI API Key**
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Deploy Schema Changes**
   ```bash
   npx convex dev
   ```
   This will update the database schema with the new `generationConfig` field.

## Using the AI Creator

### Step 1: Navigate to Creator Studio
- Go to `/creator` in your app
- Click "Choose Template" card

### Step 2: Configure Generation
Fill out the form:
- **Question Type**: Multiple Choice, Prompt Draft, or Prompt Surgery
- **Topics**: Select 1-5 skills (e.g., clarity, communication, logic)
- **Difficulty**: Beginner, Intermediate, Advanced, or Mixed
- **Question Count**: 1-20 questions
- **Style**: General, Technical, Creative, or Business
- **Target Audience**: Optional (e.g., "marketing professionals")

Click **"Generate Questions with AI"**

### Step 3: Review & Edit
- Review all generated questions
- Edit title and description (auto-generated)
- Click "Regenerate" on any question to get a new version
- Click "Edit" to modify question details
- Click **"Save as Draft"** when satisfied

### Step 4: Manage Draft
- Draft appears in "Your Drafts" on Creator Studio home
- Edit further if needed
- Submit for review when ready

## Example Usage

### Generate 5 Business Questions
```
Question Type: Multiple Choice
Topics: clarity, communication, planning
Difficulty: Intermediate
Question Count: 5
Style: Business
Target Audience: marketing professionals
```

Result: 5 complete questions with options, explanations, hints, and evaluation criteria.

### Generate Mixed Difficulty Set
```
Question Type: Prompt Draft
Topics: generative_ai, creativity
Difficulty: Mixed
Question Count: 10
Style: Creative
Target Audience: content creators
```

Result: 10 questions ranging from beginner to advanced.

## Tips

1. **Start Small**: Try 3-5 questions first to see quality
2. **Be Specific**: Better topics = better questions
3. **Use Regenerate**: Don't like a question? Regenerate it
4. **Edit Freely**: AI is a starting point, customize as needed
5. **Save Often**: Save drafts to avoid losing work

## Troubleshooting

### "OpenAI API key not configured"
- Check `.env.local` has `OPENAI_API_KEY`
- Restart dev server after adding key

### "Failed to generate questions"
- Check API key is valid
- Check you have OpenAI credits
- Try reducing question count
- Check network connection

### Questions seem off-topic
- Be more specific with topics
- Add target audience
- Try different style option
- Regenerate individual questions

## Cost

Using `gpt-4o-mini` (default):
- 5 questions: ~$0.02
- 10 questions: ~$0.04
- 20 questions: ~$0.08

Very affordable for content creation!

## What Gets Generated

For each question:
- ✅ Question text
- ✅ Difficulty level
- ✅ Topics/skills
- ✅ Expected approach
- ✅ Evaluation criteria (clarity, constraints, iteration, tool)
- ✅ 3+ helpful hints
- ✅ Options with explanations (for multiple-choice)

## Next Steps

After saving draft:
1. Review in Creator Studio
2. Edit if needed
3. Submit for review
4. Goes through calibration
5. Gets published to community

## Files Reference

- UI: `app/(routes)/creator/template/page.tsx`
- Backend: `convex/creatorStudio.ts`
- Schema: `convex/schema.ts`
- Docs: `docs/AI_CREATOR_STUDIO.md`
- Flow: `docs/AI_CREATOR_FLOW.md`
