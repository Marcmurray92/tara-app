# Architecture

## Why source rows and compiled game data are separate

The imported spreadsheets are authoring banks, not directly playable game payloads.

- Source rows preserve draft, incomplete, and invalid content.
- Compiled game data contains only validated structures ready for gameplay.
- Crossword compilation must derive a grid from clue-bank rows, so the source and playable formats are naturally different.

## Why the database model is generic

`GameContent` supports all three games without forcing them into one runtime engine.

- `gameType` scopes content by format.
- `status` allows draft, published, and archived records.
- `sourceData` stores raw authoring rows.
- `compiledData` stores the validated playable payload when a game type needs one.
- `contentVersion` supports safe local progress invalidation when gameplay-relevant data changes.

## Why progress payloads remain game-specific

The shared progress envelope handles metadata like game type, slug, content version, and schema version.

- Crossword progress stores grid cells, reveals, checks, timer data, and selection.
- Future Connections progress will need selection, solved groups, and mistake counts.
- Future Guessing progress will need answered questions and scoring.

The envelope is shared. The payloads are not.

## Adding Connections later

Phase 1 already includes:

- exact source-row parsing
- header validation
- canonical compiled game schema
- generic content storage compatibility
- homepage and route registration

Later implementation only needs the actual gameplay and authoring UI.

## Adding the Guessing Game later

Phase 1 already includes:

- exact `Letterboxed Reviews` parsing
- row-level draft and invalid handling
- canonical compiled multiple-choice question schema
- generic content storage compatibility
- homepage and route registration

Later implementation can focus on question flow, scoring, and polish.

## What is intentionally not shared

- Crossword grid logic is not forced into a generic game engine.
- Connections and Guessing do not inherit Crossword interaction state.
- Admin authoring stays game-specific where the workflows meaningfully differ.

