# Architecture

## Why source rows and compiled game data are separate

The imported spreadsheets are authoring banks, not directly playable game payloads.

- Source rows preserve draft, incomplete, and invalid content.
- Crossword source data can also retain draft authoring state like selected entries, generation seed, and completion copy before a puzzle is published.
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
- Connections progress stores selection, solved groups, submitted guesses, and mistake counts.
- Guessing progress stores answered questions, score, and streak information.

The envelope is shared. The payloads are not.

## Connections runtime

The current Connections implementation uses:

- exact source-row parsing
- header validation
- canonical compiled game schema
- local-progress tile selection, shuffle, and submit state
- one-away and duplicate-guess feedback

Admin authoring and published-content wiring can build on top of that runtime without forcing it into Crossword abstractions.

## Guessing runtime

The current Guessing Game implementation uses:

- exact `Letterboxed Reviews` parsing
- row-level draft and invalid handling
- canonical compiled multiple-choice question schema
- deterministic answer shuffling per question
- local-progress score and streak tracking

Admin authoring and published-content wiring can extend this without sharing state with Connections or Crossword.

## What is intentionally not shared

- Crossword grid logic is not forced into a generic game engine.
- Connections and Guessing do not inherit Crossword interaction state.
- Admin authoring stays game-specific where the workflows meaningfully differ.
