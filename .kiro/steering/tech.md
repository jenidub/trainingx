---
inclusion: always
---

# Tech Stack

## Framework & Runtime
- **Next.js 16** (App Router) with React 19
- **TypeScript** (strict mode disabled)
- **Node.js** ≥20.9.0, npm ≥10.8.2

## Backend & Database
- **Convex**: Real-time backend, database, auth, and functions
- **@convex-dev/auth**: Authentication system
- **OpenAI API**: AI evaluation and feedback

## UI & Styling
- **Tailwind CSS 4** with custom config
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animations
- **shadcn/ui** patterns (components in `components/ui/`)
- **Lucide React**: Icons

## Key Libraries
- **React Hook Form** + **Zod**: Form validation
- **TanStack Query**: Data fetching and caching
- **Recharts**: Data visualization
- **date-fns**: Date utilities
- **React Hot Toast / Sonner**: Notifications

## Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npx convex dev          # Start Convex backend

# Build & Deploy
npm run build           # Production build
npm start               # Start production server
npx convex deploy       # Deploy Convex functions

# Database
npx convex run <function>  # Run Convex function
# Example: npx convex run practiceProjects:seedProjects

# Linting
npm run lint            # Run ESLint
```

## Environment Variables
- `.env.local`: Local development (Convex URL, OpenAI key, etc.)
- Never commit `.env.local` to version control
