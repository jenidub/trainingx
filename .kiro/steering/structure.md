---
inclusion: always
---

# Project Structure

## Core Directories

```
app/                    # Next.js App Router
├── (routes)/          # Route groups
│   ├── dashboard/     # User dashboard
│   ├── practice/      # Practice zone & projects
│   └── auth/          # Authentication pages
├── layout.tsx         # Root layout
└── globals.css        # Global styles

components/            # React components
├── ui/               # shadcn/ui primitives (Button, Card, etc.)
├── dashboard/        # Dashboard-specific components
├── practice/         # Practice zone components
└── [feature].tsx     # Feature components (PlacementTest, DailyDrill, etc.)

convex/               # Convex backend
├── schema.ts         # Database schema
├── [table].ts        # Table-specific functions (queries, mutations)
├── migrations.ts     # Schema migrations
└── auth.config.ts    # Auth configuration

lib/                  # Utilities & helpers
├── utils.ts          # General utilities (cn, etc.)
├── scoring.ts        # Scoring algorithms
└── [feature].ts      # Feature-specific utilities

data/                 # Seed data & static content
├── projects-seed.json
├── skills-taxonomy.json
└── scenarios-bank.json

docs/                 # Documentation
hooks/                # Custom React hooks
contexts/             # React context providers
public/               # Static assets
```

## Key Conventions

- **Route structure**: Use route groups `(routes)` for organization
- **Component naming**: PascalCase for components, camelCase for utilities
- **Convex functions**: Named exports matching table operations (e.g., `list`, `create`, `update`)
- **Styling**: Use Tailwind utility classes, `cn()` helper for conditional classes
- **Type safety**: Define types inline or in component files (no separate types/ directory)
- **Imports**: Use `@/` alias for root-level imports

## Data Flow

1. **UI Component** → calls Convex query/mutation via hooks
2. **Convex Function** → validates, processes, updates database
3. **Real-time Updates** → Convex automatically syncs to all clients
4. **AI Evaluation** → OpenAI API called from Convex functions (server-side)

## Important Files

- `convex/schema.ts`: Single source of truth for database structure
- `app/layout.tsx`: Root layout with providers
- `components/providers.tsx`: ConvexProvider, QueryClient setup
- `.env.local`: Environment configuration (not in git)
