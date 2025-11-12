---
inclusion: always
---

# Development Rules

## Documentation

- **Never generate markdown files** unless explicitly requested by the user
- Do not create summary docs, progress reports, or documentation files automatically
- Focus on code changes, not documentation artifacts

## Code Style

- Use TypeScript for all new files
- Prefer functional components with hooks
- Use `const` for all declarations unless reassignment needed
- Keep components focused and single-responsibility

## Convex Patterns

- Queries for reads, mutations for writes
- Use `v.id("tableName")` for foreign keys
- Index frequently queried fields
- Handle auth in functions with `await auth.getUserIdentity(ctx)`

## Error Handling

- Validate inputs at function boundaries
- Throw descriptive errors in Convex functions
- Use try-catch for external API calls (OpenAI, etc.)
- Show user-friendly error messages in UI

## Performance

- Minimize client-side data fetching
- Use Convex indexes for efficient queries
- Lazy load heavy components
- Optimize images and assets
