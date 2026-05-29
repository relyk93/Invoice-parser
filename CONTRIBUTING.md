# Contributing

This is a private project. Notes for collaborators.

## Branch Strategy

- `main` — production, always deployable
- `dev` — integration branch, merge features here first
- `feature/your-feature` — individual feature branches

## Workflow

1. Branch off `dev`: `git checkout -b feature/my-feature dev`
2. Make changes, commit with clear messages
3. Open PR into `dev`
4. After testing, `dev` gets merged into `main` for release

## Commit Message Format

```
type: short description

feat: add CSV export button
fix: handle empty line items in parse result
chore: update dependencies
docs: update README setup steps
```

## Code Style

- TypeScript strict mode — no `any`
- Tailwind for all styling — no inline styles
- Server Components by default, `"use client"` only when needed
- API keys never committed — use `.env.local`

## Environment Setup

See README.md for full setup instructions.
