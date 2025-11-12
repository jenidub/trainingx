# AI-Powered Creator Studio

## Overview

The Creator Studio now uses AI to generate complete practice questions automatically. Instead of manually entering each question, users provide high-level parameters and AI generates structured questions with all metadata.

## How It Works

### User Flow

1. **Configure Generation** (Step 1)
   - Select question type (multiple-choice, prompt-draft, prompt-surgery)
   - Choose topics/skills (1-5)
   - Set difficulty level (beginner, intermediate, advanced, mixed)
   - Specify number of questions (1-20)
   - Pick style (general, technical, creative, business)
   - Optional: target audience

2. **Review & Edit** (Step 2)
   - AI generates complete questions with:
     - Question text
     - Difficulty level
     - Topics
     - Expected approach
     - Evaluation criteria
     - Hints
     - Options (for multiple-choice)
   - Edit title and description
   - Regenerate individual questions
   - Edit question details
   - Save as draft

### Technical Implementation

#### Backend (Convex)

**New Actions:**
- `generateQuestionsWithAI` - Batch generate questions
- `regenerateQuestion` - Regenerate a single question

**New Mutation:**
- `createDraftFromGeneration` - Save AI-generated content as draft

**Schema Updates:**
- Added `generationConfig` field to `creatorDrafts` table
- Stores AI generation metadata (model, timestamp, parameters)

#### AI Integration

Uses OpenAI API with structured JSON output:

```typescript
{
  questions: [{
    text: string,
    difficulty: "beginner" | "intermediate" | "advanced",
    topics: string[],
    expectedApproach: string,
    evaluationCriteria: {
      clarity: string,
      constraints: string,
      iteration: string,
      tool: string
    },
    hints: string[],
    options?: [{
      quality: "good" | "almost" | "bad",
      text: string,
      explanation: string
    }]
  }]
}
```

#### Prompt Engineering

The system uses carefully crafted prompts that:
- Provide clear difficulty guidelines
- Specify style/context preferences
- Include evaluation criteria framework
- Request specific output format
- Ensure quality and variety

## Features

### Batch Generation
- Generate 1-20 questions at once
- Consistent quality across set
- Themed question sets

### Individual Regeneration
- Regenerate any question without affecting others
- Maintains context and style
- Higher temperature for variation

### Full Editability
- Edit any generated content
- Modify questions, options, hints
- Update metadata

### Smart Defaults
- Auto-generates title and description
- Infers appropriate metadata
- Suggests relevant topics

## Configuration

### Environment Variables

Required:
```bash
OPENAI_API_KEY=sk-...
```

Optional:
```bash
OPENAI_MODEL=gpt-4o-mini  # Default model
```

### Cost Considerations

- Uses `gpt-4o-mini` by default (cost-effective)
- Typical cost: ~$0.01-0.05 per 10 questions
- No evaluation logs (generation only)

## Benefits

1. **10x Faster** - Create question sets in minutes vs hours
2. **Consistent Quality** - AI ensures proper structure and criteria
3. **Easy Theming** - Generate cohesive question sets
4. **Still Editable** - Full control over final content
5. **Scalable** - Create large question banks quickly

## Future Enhancements

- [ ] Save generation templates
- [ ] Batch regeneration
- [ ] Style presets
- [ ] Question difficulty calibration
- [ ] Multi-language support
- [ ] Custom evaluation criteria
- [ ] Question variations
- [ ] A/B testing support

## Usage Example

```typescript
// Generate 5 intermediate questions about clarity and communication
const result = await generateQuestions({
  config: {
    difficulty: "intermediate",
    topics: ["clarity", "communication"],
    questionCount: 5,
    style: "business",
    targetAudience: "marketing professionals",
    itemType: "multiple-choice"
  }
});

// Result contains 5 complete questions with options, hints, etc.
```

## Files Modified

- `convex/schema.ts` - Added generationConfig field
- `convex/creatorStudio.ts` - Added AI generation actions
- `app/(routes)/creator/template/page.tsx` - New AI-powered UI
- `docs/AI_CREATOR_STUDIO.md` - This documentation
