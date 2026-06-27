# Spec Alignment Action Plan

This plan compares the current app against the new local docs created from Notion on 2026-06-27.

## Current state snapshot
- The local docs scaffold now exists in the repo:
  - `AGENTS.md`
  - `docs/app-overview.md`
  - `docs/asset-structure.md`
  - `docs/letterboxd-data.md`
  - `docs/games/*`
  - `docs/spec-alignment-action-plan.md`
- Implemented games today:
  1. Crossword
  2. Connections
  3. Guessing Game / Movie Review Guess
- Not implemented yet:
  1. Who Liked It Better
- The app is currently in an active playable state with public routes for:
  - `/`
  - `/games/crossword`
  - `/games/crossword/[slug]`
  - `/games/connections`
  - `/games/guessing`
- There is still no `/games/who-liked-it-better` route.
- Local release validation on this branch:
  - `npm run typecheck` passed
  - `npm run test` passed
  - `npm run build` passed
- The current crossword seed now uses seven regenerated 20-clue boards compiled for smaller mobile-friendly grid footprints.
- A processed Letterboxd data layer now exists for Tara ratings, Tara reviews, Tara quote excerpts, and Who Liked It Better candidate comparisons.
- The fetched Notion page for `connections.md` was empty, so there is currently no detailed Connections-specific spec beyond the shared rules in `AGENTS.md`.

## Alignment summary against the local docs

### Crossword
- Partially aligned.
- The clue-count target now matches the local docs more closely at 20 clues per puzzle.
- The mobile-first board size work is in better shape than before.
- Remaining gap:
  - mobile header still needs the explicit back control described in `docs/games/crossword.md`
  - completion/navigation copy still needs a focused audit against the doc

### Connections
- Partially aligned by shared rules only.
- The game exists and builds, but the dedicated Connections spec is still effectively missing.

### Movie Review Guess
- Not aligned yet.
- The current route is playable, but it still runs as the older multi-question text-choice version rather than the 3-round poster-grid experience described in `docs/games/movie-review-guess.md`.

### Who Liked It Better
- Not aligned because it is not implemented yet.
- The data groundwork now exists, but the route, UI, and progress model still need to be built.

## Priority 0: major product/spec gaps

### 1. Add a proper Letterboxd data foundation
Current app status:
- The docs and first processed data files now exist in this branch.
- Tara ratings, Tara reviews, Tara quote excerpts, and comparison candidates are now committed as processed data.
- Optional Kanye/source images are now stored in the repo for future Who Liked It Better use.

Required work:
- Keep raw Letterboxd exports separate from app-ready data.
- Continue maintaining the processed files from scriptable inputs rather than hand-editing them ad hoc.
- Make future game UIs consume these processed files instead of duplicating hard-coded values.
- Review the low-confidence inferred Kanye candidates before surfacing them in a live game.

Likely file areas:
- `docs/letterboxd-data.md`
- `data/letterboxd/processed/*`
- `scripts/sync-letterboxd-data.mjs`
- future game seed files that consume the processed data

### 2. Rebuild Movie Review Guess to match the new spec
Current app status:
- The current implementation is a many-question quiz with one review screenshot and four text answer buttons.
- It does not run as 3 rounds.
- It does not use poster choices.
- It does not expose explicit `Easy / Medium / Hard` round labels.
- It does not have 2 mistakes per round.
- It does not expose a per-round failure/retry loop.

Required work:
- Replace the current `GuessingQuestion`/`GuessingProgress` model with a round-based structure.
- Support 3 rounds per game.
- Each round needs:
  - one review screenshot
  - 4 poster options in a 2x2 grid
  - one correct poster + three decoys
  - a visible difficulty label: `Easy`, `Medium`, or `Hard`
  - 2 mistakes remaining
  - per-round win/fail handling
- Add explicit round success, failed-round, and final-victory states.
- Keep progress persistence truthful and stable across refreshes.

Likely file areas:
- `src/features/guessing/game/*`
- `src/features/guessing/seed/*`
- `src/components/guessing/guessing-game.tsx`
- `src/app/games/guessing/page.tsx`
- poster assets under `public/images/games/movie-review-guess/posters/`
- tests for the new round model and UI flow

### 3. Build Who Liked It Better as a fourth game
Current app status:
- This game type does not exist in the repo yet.
- Global game typing, registry, progress, nav, and home cards only support three games.

Required work:
- Add a new game type and route.
- Create game data, schema, progress storage, engine logic, and UI.
- Build the mobile-first interaction flow from the spec:
  - poster
  - movie title
  - Tara vs celebrity buttons
  - ratings reveal after every guess
  - final score/results screen
- Add persistence if desired, and make sure copy/tone matches the rest of the app.

Likely file areas:
- `src/features/games/game.types.ts`
- `src/features/games/game-registry.ts`
- `src/features/games/birthday-progress.ts`
- `src/components/games/birthday-progress.tsx`
- `src/components/home/home-game-cards.tsx`
- `src/components/app-shell/app-header.tsx`
- new `src/features/who-liked-it-better/` files
- new `src/components/who-liked-it-better/` files
- new `src/app/games/who-liked-it-better/page.tsx`
- new poster assets and tests

Additional data requirements:
- consume `data/letterboxd/processed/who-liked-it-better-candidates.json`
- render optional celebrity/source images when a candidate provides one
- avoid unresolved or tie rows unless the interaction design explicitly supports them

### 4. Expand cross-app progression from 3 games to 4 games
Current app status:
- Progress, registry, and home/game surfacing only know about crossword, connections, and guessing.

Required work:
- Update the global progress model to include Who Liked It Better.
- Update completion logic and final all-games-cleared behaviour.
- Add the fourth game to the home carousel and any persistent nav that should expose it.
- Recheck "next puzzle" logic once a fourth game exists.

## Priority 1: medium gaps

### 5. Regenerate crossword content for tighter, shorter-fill grids
Current app status:
- Done in this branch at a first-pass level.
- The seed bank now includes the recent short-fill clue additions plus the older submitted clue bank.
- The seven seeded boards have been regenerated to 20 clues each.
- Current compiled sizes are:
  - `14x12`
  - `13x13`
  - `12x13`
  - `14x13`
  - `14x15`
  - `15x12`
  - `13x14`

Required work:
- Keep using the newer short and medium answers as the backbone of future regenerated sets.
- If more density is wanted later, push toward `22-24` clues without breaking the compact footprints.
- Recheck clue correctness, duplicate answers within each puzzle, and crossing quality whenever a new clue import lands.

Likely file areas:
- `src/features/crossword/seed/tara-crossword-clue-bank.json`
- `src/features/crossword/seed/tara-crosswords.ts`
- `src/features/crossword/generator/*`

### 6. Bring Crossword mobile header fully into spec
Current app status:
- Mobile crossword currently shows timer and hamburger/menu.
- The spec expects back button + timer + hamburger.

Required work:
- Add an explicit back/home control on the mobile crossword top row.
- Confirm the back action preserves progress and returns to the right location.
- Keep the row compact so it does not break the established mobile fit.

Likely file areas:
- `src/components/crossword/crossword-game.tsx`
- possibly shared nav helpers if needed

### 7. Audit Crossword completion/navigation against the new doc
Current app status:
- Crossword completion already exists and offers onward navigation.
- Existing data currently routes back to the crossword list or home depending on puzzle content.

Required work:
- Check whether every crossword completion state clearly offers:
  - next crossword when appropriate
  - next puzzle when appropriate
  - back to home
- Confirm blank/missing puzzle states use the clearer tone and never render a broken grid.

Likely file areas:
- `src/components/crossword/crossword-completion-dialog.tsx`
- `src/app/games/crossword/[slug]/error.tsx`
- crossword seed/source data in `src/features/crossword/`

### 8. Rename/scope the current Guessing Game more explicitly as Movie Review Guess
Current app status:
- The code and UI still use the broader `guessing` naming.
- The new docs define the game more specifically as Movie Review Guess.

Required work:
- Decide whether to keep the internal code namespace as `guessing` and only change player-facing labels, or rename both code and UI.
- At minimum, align player-facing copy and docs.

Likely file areas:
- `src/features/games/game-registry.ts`
- `src/components/app-shell/app-header.tsx`
- page titles/subtitles in `src/features/guessing/seed/placeholder-guessing.ts`

## Priority 2: documentation and structure gaps

### 9. Fill in the missing Connections-specific spec
Current app status:
- `docs/games/connections.md` is only a placeholder because the source Notion page was empty.

Required work:
- Write or fetch a real Connections-specific spec before doing more focused redesign work there.
- Until then, preserve current behaviour and use shared AGENTS rules only.

### 10. Formalise poster/review asset structure for upcoming game work
Current app status:
- Review screenshots live in `public/guessing-reviews/`.
- There is no fully adopted poster/source-image directory structure for Movie Review Guess or Who Liked It Better.

Required work:
- Decide and adopt stable poster and source-image directories before implementing the new poster-heavy specs.
- Move slowly here: avoid renaming current working assets unless the new implementation actually needs it.

## Recommended execution order
1. Decide the final asset/data model for poster-based games.
2. Rebuild Movie Review Guess around 3 rounds + 4 posters + 2 mistakes.
3. Add the fourth game type and implement Who Liked It Better with optional source images.
4. Expand cross-game progress/navigation to 4 games.
5. Finish the smaller crossword header/completion audit.
6. Backfill tests and mobile smoke checks for the new game flows.

## Validation checklist for the future implementation pass
- `npm run typecheck`
- `npm run test`
- `npm run build`
- mobile viewport smoke test for:
  - crossword
  - connections
  - movie review guess
  - who liked it better
