# Custom Specialized Domains: The "Manifesto" Engine

## Vision

We are not just adding a form to create domains. We are building a **Curriculum Engine**. The user acts as the Visionary, and the AI acts as the Dean of a bespoke university. The user writes a "Manifesto" — a single, powerful statement of intent — and the system constructs a complete, gamified learning path in seconds.

## User Experience: The Magic Flow

1. **The Portal**: In the Practice Zone, a "Create New Domain" card that stands out. It's not a button; it's an invitation.
2. **The Manifesto**: No wizard with 10 steps. Just one input: "What do you want to master, and why?"
   - _Example:_ "I want to master high-stakes negotiation for selling SaaS to enterprise CTOs."
   - _Example:_ "I want to learn how to debug complex React concurrency issues."
3. **The Fabrication**: A progress screen that _shows work_. responding to the user's manifesto.
   - "Analyzing 'High-Stakes Negotiation'..."
   - "Consulting 'Enterprise Sales' matrix..."
   - "Drafting scenarios: 'The Skeptical CTO', 'The Budget Freeze'..."
   - "Finalizing curriculum..."
4. **The Reveal**: The domain appears with a generated title, a perfect emoji icon, and a color palette that matches the "vibe" of the topic.
5. **The Journey**: A focused, 3-track curriculum. 15 bespoke challenges per track. No fluff.

## Goals

- **Radical Simplicity**: One input from the user.
- **High Fidelity**: Content must feel hand-crafted, not generic.
- **Ownership**: The user feels like they "built" this.
- **Privacy**: V1 is private to the creator.

## Limits & Constraints

- **Cap**: 10 Active Custom Domains per user. (Encourage deleting old ones to make space for new focuses).
- **Structure**: Fixed architecture for elegance and consistency.
  - 1 Domain
  - 3 Tracks (Fixed)
  - 1 Level per Track
  - 15 Cards per Level
- **No Refinement Loop (V1)**: If it's not right, delete it and write a better manifesto. This teaches the user to prompt better (and simplifies our UI).

## Data Model Strategy

### 1. New Table: `customDomainRequests`

Tracks the "Fabrication" process.

- `userId`: Id<"users">
- `manifesto`: string (The user's raw input)
- `status`: "queued" | "researching" | "generating" | "completed" | "failed"
- `progress`: number (0-100)
- `logs`: array of strings (displayed to user during generation, e.g., "Drafting Track 2...")
- `domainId`: Id<"practiceDomains"> (set upon completion)
- `error`: string (optional)

### 2. Schema Updates

Enrich existing tables to support user-generated content without separate tables.

- `practiceDomains`, `practiceTracks`, `practiceLevels`, `practiceItems`:
  - `createdBy`: Id<"users"> (optional)
  - `isUserGenerated`: boolean (index this!)

## Backend Architecture (Convex)

1.  **Mutation `customDomains.initiate(manifesto)`**:
    - Checks limits (count < 10).
    - Creates `customDomainRequests` entry.
    - Triggers the async AI action.
    - Returns `requestId`.

2.  **Action `customDomains.fabricate`**:
    - **Step 1 (The Architect)**: LLM generates the Domain Title, Icon, Color, and 3 Track Titles/Descriptions based on the manifesto.
    - **Step 2 (The Builder)**: Parallel calls (or sequential if rate-limited) to generate the 15 items for each track.
    - **Step 3 (The Committer)**: Transact all data into the DB. Update `customDomainRequests` to 'completed'.

## UI/UX Plan

- **Entry**: A special card at the end of the Domains list.
- **Creation Page**: Minimalist. focused. Large text area. "Inspire me" button.
- **Loading State**: The "Terminal" view. Typewriter effects showing the "logs" from the backend.
- **Dashboard**: A "My Custom Domains" section or blended into the main list with a distinct badge.

## Implementation Steps

1.  **Schema**: Update `schema.ts`.
2.  **Backend**: Implement `initiate` mutation and `fabricate` action.
3.  **UI**: Build the Creation Page and the Loading "Terminal".
4.  **Integration**: Hook it all up.

## Future (Ultra-Think V2)

- **Shareable**: "I built a great negotiation course. Try it."
- **Remix**: Fork someone else's domain and adjust the manifesto.
- **Adaptive**: If you fail a card, the AI generates a remedial card instantly.
