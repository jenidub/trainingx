# AI Creator Studio Flow

## User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATOR STUDIO HOME                       │
│  - View stats (published, plays, rating)                    │
│  - Choose creation method                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Click "Choose Template"
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: CONFIGURE AI GENERATION                 │
│                                                              │
│  Question Type:     [Multiple Choice ▼]                     │
│  Topics/Skills:     [clarity] [communication] [logic]       │
│  Difficulty:        [Intermediate ▼]                        │
│  Question Count:    [5]                                      │
│  Style:            [Business ▼]                             │
│  Target Audience:   [marketing professionals]               │
│                                                              │
│              [✨ Generate Questions with AI]                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Call OpenAI API
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: REVIEW & EDIT QUESTIONS                 │
│                                                              │
│  Title:        [Intermediate multiple choice - clarity...]  │
│  Description:  [Practice multiple choice questions...]      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Question 1                    [🔄 Regenerate] [✏️ Edit]│   │
│  │ Difficulty: intermediate      Topics: clarity, logic  │   │
│  │                                                       │   │
│  │ Question: What is the best approach to...            │   │
│  │ Expected: Provide clear, specific language...        │   │
│  │                                                       │   │
│  │ Options:                                              │   │
│  │ ✓ Use specific, measurable terms (good)              │   │
│  │ ○ Use general descriptive language (almost)          │   │
│  │ ○ Use technical jargon (bad)                         │   │
│  │                                                       │   │
│  │ Hints:                                                │   │
│  │ • Consider your audience's expertise                 │   │
│  │ • Think about measurability                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [... more questions ...]                                   │
│                                                              │
│  [← Back to Config]              [💾 Save as Draft]         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Save to Database
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DRAFT SAVED                               │
│  - Appears in "Your Drafts" section                         │
│  - Can be edited further                                     │
│  - Can be submitted for review                              │
└─────────────────────────────────────────────────────────────┘
```

## Technical Flow

```
┌──────────────┐
│   UI Layer   │
│  (React)     │
└──────┬───────┘
       │
       │ 1. User configures generation
       │    (difficulty, topics, count, style)
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  useAction(api.creatorStudio.generateQuestionsWithAI)   │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 2. Call Convex action
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  convex/creatorStudio.ts                                 │
│  - generateQuestionsWithAI (action)                      │
│    • Build system prompt with config                     │
│    • Call OpenAI API                                     │
│    • Parse JSON response                                 │
│    • Validate & normalize                                │
│    • Return questions array                              │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 3. Call OpenAI
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  OpenAI API (gpt-4o-mini)                                │
│  - Structured JSON output                                │
│  - Temperature: 0.8 (creative)                           │
│  - Response format: json_object                          │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 4. Return structured questions
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  UI Layer (React)                                        │
│  - Display questions                                     │
│  - Enable editing                                        │
│  - Allow regeneration                                    │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 5. User saves draft
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  useMutation(api.creatorStudio.createDraftFromGeneration)│
└──────┬───────────────────────────────────────────────────┘
       │
       │ 6. Save to database
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Convex Database                                         │
│  - creatorDrafts table                                   │
│    • content: { questions: [...] }                       │
│    • generationConfig: { difficulty, topics, ... }       │
│    • metadata: { skills, difficulty, ... }               │
└──────────────────────────────────────────────────────────┘
```

## Regeneration Flow

```
User clicks "Regenerate" on Question 3
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  useAction(api.creatorStudio.regenerateQuestion)         │
│  - Pass config + previous question text                  │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  OpenAI API                                              │
│  - Generate 1 new question                               │
│  - Temperature: 0.9 (more variation)                     │
│  - Avoid similarity to previous                          │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  UI Layer                                                │
│  - Replace question at index 3                           │
│  - Keep other questions unchanged                        │
└──────────────────────────────────────────────────────────┘
```

## Data Structure

### Generation Config
```typescript
{
  difficulty: "beginner" | "intermediate" | "advanced" | "mixed",
  topics: string[],           // 1-5 topics
  questionCount: number,      // 1-20
  style?: "technical" | "creative" | "business" | "general",
  targetAudience?: string,
  itemType: "multiple-choice" | "prompt-draft" | "prompt-surgery"
}
```

### Generated Question
```typescript
{
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
  options?: [{  // Only for multiple-choice
    quality: "good" | "almost" | "bad",
    text: string,
    explanation: string
  }]
}
```

### Saved Draft
```typescript
{
  creatorId: Id<"users">,
  type: "item",
  title: string,
  description: string,
  content: {
    questions: GeneratedQuestion[],
    itemType: string
  },
  status: "draft",
  metadata: {
    skills: string[],
    difficulty: string,
    estimatedTime: number,
    tags: string[]
  },
  generationConfig: {
    difficulty: string,
    topics: string[],
    questionCount: number,
    style?: string,
    targetAudience?: string,
    aiModel: string,
    generatedAt: number
  },
  createdAt: number,
  updatedAt: number
}
```

## Key Benefits

1. **No Manual Entry** - AI generates everything
2. **Batch Creation** - 1-20 questions at once
3. **Consistent Quality** - Structured output
4. **Full Control** - Edit anything
5. **Fast Iteration** - Regenerate individual questions
6. **Smart Defaults** - Auto-generated metadata
