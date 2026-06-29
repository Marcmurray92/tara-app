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
  3. Movie Review Guess
  4. Who Liked It Better
- The app is currently in an active playable state with public routes for:
  - `/`
  - `/games/crossword`
  - `/games/crossword/[slug]`
  - `/games/connections`
  - `/games/guessing`
  - `/games/who-liked-it-better`
- Local release validation on this branch:
  - `npm run typecheck` passed
  - `npm run test` passed
  - `npm run build` passed
- Movie Review Guess now runs as a 3-round saved experience with:
  - `Easy / Medium / Hard` round labels
  - 2 mistakes per round
  - failed-round retry flow
  - final victory screen
  - Tara quote delight copy sourced from processed Letterboxd data
- The current crossword seed now uses six regenerated date-named boards sourced from the latest crossword CSV clue bank.
- A processed Letterboxd data layer now exists for Tara ratings, Tara reviews, Tara quote excerpts, and Who Liked It Better candidate comparisons.
- Who Liked It Better now ships as a saved multi-question route using the kept Kanye rounds plus optional source receipts when available.
- A dedicated local Connections spec now exists in `docs/games/connections.md`, and the game flow can now align against it directly.

## Alignment summary against the local docs

### Crossword
- Partially aligned.
- The seed set now follows the updated date-based naming convention and ships with 30-50 clue boards.
- The mobile-first board size work is in better shape than before.
- The mobile header now includes the expected back control alongside the timer and menu.
- The completion dialog now offers `Next Crossword`, `Next Puzzle`, and `Back to Home` where appropriate.
- Remaining gap:
  - completion copy could still use one final tone pass against the doc

### Connections
- Mostly aligned.
- The game now has a dedicated local spec, saved progress, win/loss completion states, and an emoji-grid summary of submitted guesses.
- Remaining gap:
  - do one more device pass to check density and tap comfort on the live mobile board

### Movie Review Guess
- Mostly aligned.
- The route now uses the intended 3-round structure, round persistence, two-mistake loop, round success/failure states, and final victory state.
- Review screenshots now resolve through the game-specific review asset directory and the answer options already use poster assets from a dedicated poster directory.
- The shipped format is now the intended simple version:
  - 3 rounds
  - `Easy / Medium / Hard`
  - 4 poster options in a single horizontal row per round
- Remaining gap:
  - the shipped poster set is still a curated placeholder library rather than final poster artwork
  - the final content pass is now mainly about round curation and deciding whether placeholders are good enough for launch

### Who Liked It Better
- Mostly aligned.
- The route, progress model, results flow, home grouping, and app-wide fourth-game progress wiring now exist.
- Optional source images are rendered on supported rounds.
- The playable question set now includes the kept Kanye rounds that have Tara matches, with source receipts shown when available.
- Remaining gap:
  - the current poster art is a generated gothic placeholder set rather than a final curated poster library
  - the remaining curation call is whether every kept comparison round is fun enough to ship, not whether the app can technically support it

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
- Recheck low-confidence comparison candidates during curation, but the current fun-first ship set can stay in the playable build.

Likely file areas:
- `docs/letterboxd-data.md`
- `data/letterboxd/processed/*`
- `scripts/sync-letterboxd-data.mjs`
- future game seed files that consume the processed data

### 2. Finish the last Movie Review Guess asset/content pass
Current app status:
- The route now uses a round-based `Easy / Medium / Hard` model with saved progress and final victory flow.
- Each round already has one review screenshot, four answer options in a single row, a visible mistake counter, and retry handling.
- The current seeded rounds already point at dedicated review and poster asset directories.

Required work:
- Decide whether the shipped version needs curated final poster artwork, or whether the current placeholder poster set is sufficient.
- If real poster art is wanted:
  - replace the placeholder poster files
  - keep the existing asset paths stable
- Do one final content pass on which 3 rounds are most fun and best balanced.

Likely file areas:
- `src/features/guessing/game/*`
- `src/features/guessing/seed/*`
- `src/components/guessing/guessing-game.tsx`
- `src/app/games/guessing/page.tsx`
- review screenshots under `public/images/games/movie-review-guess/reviews/`
- poster assets under `public/images/games/movie-review-guess/posters/`
- tests for the new round model and UI flow

### 3. Build Who Liked It Better as a fourth game
Current app status:
- Done in this branch for the playable seeded version.
- The game route, engine, storage, UI, poster placeholders, kept Kanye rounds, and global progress integration now exist.

Required work:
- Do a final content curation pass on which candidate rows should ship.
- Decide whether to replace the placeholder poster set with real poster artwork.
- Reconfirm whether every kept Kanye row still feels fun enough to keep in the ship set.
- If admin authoring for this game becomes important, extend the database-backed content pipeline rather than leaving it seed-only.

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
- Done in this branch.
- Home, registry, progress surfaces, and completion copy now understand four games.

Required work:
- Recheck ordering only if we later decide a section should move in the home stack or the next-puzzle sequence.

## Priority 1: medium gaps

### 5. Regenerate crossword content for tighter, shorter-fill grids
Current app status:
- Done in this branch at a refreshed source-of-truth level.
- The crossword clue bank now comes directly from the latest approved CSV import.
- The current seeded set contains six dated boards with 30-50 clues each.
- Current compiled sizes are:
  - `17x17`
  - `17x17`
  - `17x17`
  - `15x16`
  - `17x17`
  - `17x17`

Required work:
- Keep using the latest approved CSV as the canonical clue bank for future regeneration passes.
- Recheck clue correctness, duplicate answers within each puzzle, and crossing quality whenever a new clue import lands.
- If another content pass needs more daily boards, generate additional dated puzzles rather than reverting to the old numbered set.

Likely file areas:
- `src/features/crossword/seed/tara-crossword-clue-bank.json`
- `src/features/crossword/seed/tara-crosswords.ts`
- `src/features/crossword/generator/*`

### 6. Bring Crossword mobile header fully into spec
Current app status:
- Done in this branch.
- Mobile crossword now shows back button + timer + hamburger on the compact top row.

Required work:
- None unless the interaction needs another round of visual polish after device testing.

Likely file areas:
- `src/components/crossword/crossword-game.tsx`
- possibly shared nav helpers if needed

### 7. Audit Crossword completion/navigation against the new doc
Current app status:
- Mostly done in this branch.
- The dialog now offers:
  - next crossword when another seeded grid exists
  - next puzzle when another game is still incomplete
  - back to home

Required work:
- Confirm blank/missing puzzle states use the clearer tone and never render a broken grid.
- Do a final wording pass on the victory copy if we want it even closer to the doc voice.

Likely file areas:
- `src/components/crossword/crossword-completion-dialog.tsx`
- `src/app/games/crossword/[slug]/error.tsx`
- crossword seed/source data in `src/features/crossword/`

### 8. Rename/scope the current Guessing Game more explicitly as Movie Review Guess
Current app status:
- Mostly done in this branch.
- Player-facing labels now use `Movie Review Guess` / `Review Guess`.
- The internal code namespace remains `guessing`, which is fine unless we want a larger filesystem rename later.

Required work:
- No urgent work required.
- Only rename the internal code namespace if we later decide the extra churn is worth it.

Likely file areas:
- `src/features/games/game-registry.ts`
- `src/components/app-shell/app-header.tsx`
- page titles/subtitles in `src/features/guessing/seed/placeholder-guessing.ts`

## Priority 2: documentation and structure gaps

### 9. Keep the Connections implementation aligned with the local spec
Current app status:
- `docs/games/connections.md` now exists as a real local spec.

Required work:
- Keep the live game flow aligned with that doc:
  - win or lose after the expected end states
  - emoji-grid recap on completion
  - `Play another Connections` and `Back to Home` actions

### 10. Formalise poster/review asset structure for upcoming game work
Current app status:
- Review screenshots, poster assets, and source evidence now have game-specific directories under `public/images/games/`.
- A temporary legacy review screenshot copy still exists in `public/guessing-reviews/` while older references are phased out.

Required work:
- Keep new references on the `public/images/games/...` paths.
- Remove the legacy `public/guessing-reviews/` copy only after we are confident nothing still points at it.

## Recommended execution order
1. Curate the final 3 Movie Review Guess rounds and decide whether placeholder posters are good enough for launch.
2. Do the final candidate curation pass for Who Liked It Better.
3. Keep the current Connections implementation aligned with the local spec after each UI pass.
4. Backfill tests and mobile smoke checks for the four current game flows.

## Validation checklist for the future implementation pass
- `npm run typecheck`
- `npm run test`
- `npm run build`
- mobile viewport smoke test for:
  - crossword
  - connections
  - movie review guess
  - who liked it better
