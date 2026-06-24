# Tara's 30th

Tara's 30th is a mobile-first Next.js web app for a personalised birthday games collection.

Phase 1 ships:

- a complete crossword experience
- a shared homepage and navigation shell
- coming-soon routes for Connections and the Guessing Game
- typed spreadsheet parsers for all three game formats
- a generic Prisma-backed content model
- a protected admin area for crossword import and generation
- PWA and Railway deployment preparation

## Routes

- `/` homepage
- `/games/crossword/taras-birthday-crossword` published placeholder crossword
- `/games/connections` coming-soon route
- `/games/guessing` coming-soon route
- `/admin/login` protected admin login
- `/admin` admin dashboard
- `/admin/crosswords/new` crossword authoring studio
- `/admin/crosswords/[id]` saved crossword edit route
- `/admin/crosswords/[id]/preview` saved crossword preview route
- `/api/health` Railway health endpoint

## Architecture

- `src/app` contains the App Router routes.
- `src/components` contains shared UI, public shell, import views, and crossword components.
- `src/features` contains domain logic, parsers, content validation, generation, and local progress logic.
- `prisma/schema.prisma` defines the generic `GameContent` model.
- `prisma/seed.ts` upserts the placeholder crossword by game type and slug.

See [docs/architecture.md](/Users/marcmurray/.codex/worktrees/5f41/TaraBday/docs/architecture.md) for the reasoning behind the separation between source rows, compiled data, and game-specific progress.

## Game Registry

The typed game registry powers homepage cards and shared navigation.

- `crossword` is available now
- `connections` is marked coming soon
- `guessing` is marked coming soon

Turning on a future game should only require updating the registry entry and adding the route implementation.

## Generic Database Model

The generic `GameContent` Prisma model stores:

- `gameType`
- `slug`
- `title`, `subtitle`, `description`
- `status`
- `sourceSchemaVersion`
- `compiledSchemaVersion`
- `contentVersion`
- `sourceData`
- `compiledData`

This keeps the content system shared without forcing gameplay state into one abstraction.

## Source Data vs Compiled Data

- Source data mirrors spreadsheet authoring rows, including incomplete draft content.
- For crossword drafts, source data now also preserves editor state such as selected row ids, generation seed, completion copy, and import metadata.
- Compiled data stores only validated playable structures.
- Crossword compilation is required because the source sheet does not contain a finished grid.

## Spreadsheet Formats

### Crossword

Exact required headings:

```text
Clue,Answer,Category
```

### Connections

Exact required headings:

```text
Category,Movie 1,Movie 2,Movie 3,Movie 4
```

### Guessing Game

Exact required headings:

```text
Right Answer,Answer 2,Answer 3,Answer 4,Letterboxed Reviews
```

See [docs/data-formats.md](/Users/marcmurray/.codex/worktrees/5f41/TaraBday/docs/data-formats.md) for examples and validation details.

## CSV and TSV Import

- CSV and TSV input use Papa Parse rather than string splitting.
- Quoted commas, quoted line breaks, UTF-8 BOM characters, and Google Sheets TSV paste data are supported.
- Blank rows are ignored.
- Incomplete rows are retained as draft content.
- Invalid rows remain visible in the preview with row-level issues.

## Crossword Generation

The crossword generator:

1. normalizes selected answers
2. sorts candidates by length and shared-letter potential
3. places a strong starting entry horizontally
4. finds legal perpendicular placements for remaining entries
5. rejects collisions and illegal touching
6. runs multiple seeded attempts
7. keeps the best connected layout
8. trims the final bounding box
9. numbers Across and Down clues conventionally

Unplaced rows are reported explicitly rather than being dropped silently.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

## Environment Variables

Create a local `.env` from `.env.example` and provide:

```env
DATABASE_URL=
ADMIN_PASSWORD=
SESSION_SECRET=
NEXT_PUBLIC_APP_NAME=Tara's 30th
```

## Prisma Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
npm run db:studio
```

## Migration Status

The repository now includes an initial committed Prisma migration:

```text
prisma/migrations/20260624000000_init/migration.sql
```

That means the first real PostgreSQL-backed deploy should use `npx prisma migrate deploy` against the target database rather than relying on `db push`.

## Seed Instructions

The seed script upserts one placeholder crossword at slug `taras-birthday-crossword`.

- it is idempotent
- it uses the same compiled crossword pipeline as the app
- it does not create duplicate content records

## Admin Login

- Admin auth uses `ADMIN_PASSWORD`
- Sessions use an HTTP-only signed cookie based on `SESSION_SECRET`
- Protected pages redirect to `/admin/login`

## Publishing a Crossword

1. Open `/admin/crosswords/new`
2. Paste CSV or TSV, or upload a file
3. Parse the import preview
4. Review complete, incomplete, and invalid rows
5. Select complete rows to use in the compiled puzzle
6. Generate with a seed
7. Review placed and unplaced entries
8. Save as draft or publish
9. Reopen the saved record from the dashboard to edit it
10. Use the saved preview route to inspect the persisted compiled puzzle
11. Duplicate a saved record into a new draft when you want a variant
12. Archive records you no longer want in the active working set

## PWA Behaviour

- `public/manifest.webmanifest` configures installability
- a service worker caches the public shell and visited public routes
- admin routes are intentionally excluded from caching
- local crossword progress remains device-local through `localStorage`

## Testing

Planned verification commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Railway Deployment

This repo is prepared for Next.js standalone deployment.

- `next.config.mjs` sets `output: "standalone"`
- `scripts/prepare-standalone.mjs` copies `public` and `.next/static`
- `scripts/start-standalone.mjs` binds to `0.0.0.0` and respects `PORT`

### Railway setup steps

1. Open the existing Railway project.
2. Create or select the application service.
3. Connect the GitHub repository `Marcmurray92/tara-app`.
4. Select the branch you want Railway to deploy.
5. Set `DATABASE_URL=${{Postgres.DATABASE_URL}}` using the correct PostgreSQL service name.
6. Create `ADMIN_PASSWORD`.
7. Create a strong `SESSION_SECRET`.
8. Set the pre-deploy command to `npx prisma migrate deploy`.
The repo already contains the initial migration, so Railway should apply that migration on first deploy.
9. Confirm the build command uses `npm run build`.
10. Confirm the start command uses `npm run start`.
11. Set the health check path to `/api/health`.
12. Deploy the service.
13. Generate a Railway public domain.
14. Run `npm run db:seed` once after the database is ready.
15. Open `/admin` and sign in.
16. Replace the placeholder crossword data when final content is ready.
17. If builds fail, inspect the Railway build logs and confirm environment variables are present.
18. If Prisma migrations fail, confirm `DATABASE_URL` points to the intended PostgreSQL service.
19. If the database reference variable fails, verify the Railway PostgreSQL service name in the `${{...}}` reference.
20. Redeploy after each GitHub push once configuration is stable.

## Known Limitations

- The placeholder crossword content is intentionally temporary.
- Connections and Guessing gameplay are not built in Phase 1.
- Public routes currently rely on placeholder content until a database-backed published crossword replaces it.

## Future Notes

Connections will later add tile selection, grouping, mistake tracking, and solved-state presentation on top of the existing source schema and compiled game structure.

The Guessing Game will later add question flow, answer shuffling, streak logic, and scoring on top of the existing source schema and compiled question structure.
