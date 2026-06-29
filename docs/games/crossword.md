# Crossword

## Core model
The crossword is a mobile-first puzzle game where Tara solves personalised clues.
Generated crossword content should stay playful, fair, and well crossed before it tries to be perfectly symmetrical.
Preserve existing crossword behaviour unless the task explicitly asks to change it.

## Puzzle naming and ordering
- Seeded crosswords should be named by date, ascending, starting from `June 30th`.
- Continue sequentially: `July 1st`, `July 2nd`, `July 3rd`, and so on.
- The generated puzzle manifest/order should match that chronological order.
- Do not invent extra theme titles unless the app structure requires them.

## Grid rules
- Grid size must stay between `12x12` and `17x17`.
- Aim for an average close to `15x15`.
- Only push up to `17x17` when a longer anchor entry needs the space cleanly.
- Avoid sparse oversized boards and avoid disconnected mini-grids.

## Clue count and entry rules
- Each crossword should contain `30-50` clues total across both directions.
- Do not repeat an answer within the same crossword.
- Avoid reusing the same answer across the wider seeded set unless it is genuinely necessary.
- Do not build split clues such as `See 14-Across`, `With 7-Down`, or other paired multi-entry clue structures.
- Every clue should map to exactly one continuous across or down answer.

## Clue formatting
- Preserve punctuation that helps the joke or clue type land:
  - quotes
  - apostrophes
  - underscores
  - ellipses
  - emoji where already approved
- Quote and fill-in-the-blank clues should keep their original formatting from the clue bank.
- Do not flatten odd, crude, funny, or personal clue wording unless a technical issue forces it.

## Answer formatting
- Keep human-readable answers in the source data.
- Normalise grid answers for placement as:
  - uppercase
  - spaces removed
  - punctuation removed
  - letters and numbers preserved if the engine supports them
- If a clue uses a number-based answer and engine support changes, document the handling explicitly rather than silently rewriting it.
- Prefer answers with 3 or more characters.
- Avoid adding artificial 2-letter filler unless the board genuinely needs it and the engine already supports it.

## Crossing and fill policy
- Every white cell must connect to the main crossword.
- Long, obscure, personal, or joke answers should have generous crossings.
- Avoid barely crossed long entries and avoid large fragile sections.
- Short/common connector entries are allowed when they improve density and fairness.

Acceptable connector-style fill can include entries like:
- `AREA`
- `EERIE`
- `OIL`
- `OLE`
- `ERA`
- `ORE`
- `EON`
- `ATE`
- `ALE`
- `OAR`
- `EAR`
- `ARE`
- `IRE`
- `EEL`

Use connectors to support the puzzle, not to dominate it.

## Layout
Expected mobile layout:
1. Top container row
2. Puzzle grid
3. Clue row
4. Keyboard

The layout should feel close to a familiar mobile crossword experience while keeping the app's gothic, personal, handmade birthday style.

## Top container row
The top row contains:
- Back button on the left for returning to the main menu.
- Timer in the middle.
- Hamburger/menu icon on the right.

Expected behaviour:
- Back returns to the main menu or previous puzzle list.
- Back navigation should not unexpectedly erase progress.
- Timer remains visible while playing.
- Hamburger opens puzzle options if implemented.
- Do not add extra controls to this row unless requested.

## Puzzle grid
The puzzle grid is the main play area.

Expected behaviour:
- Tapping a cell selects it.
- Tapping an already-selected cell may toggle direction between across and down if supported.
- The active cell is clearly highlighted.
- The active answer/word is visually distinct from the rest of the grid.
- Entering a letter fills the selected cell and advances to the next cell.
- Backspace clears the current cell or moves backward, depending on existing behaviour.
- Do not visibly mark words as complete just because the typed letters happen to be correct.
- The player should need to use a check action to discover incorrect letters.
- The grid should remain usable on a phone-sized viewport.

## Clue row
The clue row appears below the puzzle grid and above the keyboard.

Expected behaviour:
- Shows the active clue.
- Includes clue number and direction where practical.
- Updates when the selected cell or active word changes.
- Tapping next/previous clue controls should move between unfinished clues if any unfinished clues remain.
- Moving to another clue should focus the first empty tile in that clue where possible.
- Long clues should wrap or scroll gracefully without breaking the layout.
- The clue row should remain readable without zooming.

## Keyboard
The crossword uses an on-screen keyboard.

Expected behaviour:
- Keyboard appears below the clue row.
- Keys are large enough to tap comfortably.
- Letter input should update the active cell.
- Backspace should be available.
- Keyboard should not cover the active clue or selected cell.
- Avoid relying on the device keyboard unless that is already the implemented pattern.
- Physical keyboard input may be supported, but mobile touch input is the priority.

## Completion
A crossword is complete when all required cells contain the correct letters.

On completion:
- Mark the puzzle as complete.
- Preserve completion state after refresh if persistence exists.
- Show a simple victory state or completion message.
- Offer a route to the next puzzle if available.
- Offer a route back to Home.

Suggested copy style:
- `You ate.`
- `No crumbs.`
- `Actually iconic.`
- `Crossword behaviour.`
- `Tara supremacy confirmed.`

Avoid corporate completion copy.

## Checking and clearing
- `Check Puzzle` should mark incorrect filled letters.
- `Clear Puzzle` should clear only the letters currently marked incorrect by checking.
- `Clear Puzzle` should not wipe correct progress unless explicitly requested.

## Full but incorrect state
If the player fills the entire grid but it is not fully correct:
- Show a compact modal/dialog such as `Not quite!`
- Explain that the puzzle is full but some letters are still wrong.
- Do not silently leave the player wondering why the puzzle has not completed.

## Navigation after completion
After winning:
- If another crossword is available, offer `Next Crossword`.
- If another puzzle/game is available, offer `Next Puzzle`.
- Always offer `Back to Home`.
- Do not send the player to a locked puzzle without explanation.

## Blank/loading state
If crossword data is missing or cannot load:
- Do not render a broken grid.
- Show a clear missing-puzzle message.
- Offer `Back to Home`.

Example copy direction:
- `This crossword has vanished into the gothic mist.`
- `The grid failed the vibe check.`
- `This puzzle is missing. Suspicious.`

## CSV source-of-truth assumptions
- Treat the active clue CSV as the canonical crossword clue bank for regeneration passes.
- Preserve clue wording except for technical escaping/whitespace cleanup.
- Use existing approved connector entries already in the project before inventing new filler.
- If generated connector clues are ever added, they should be clearly identifiable and used sparingly.

## Validation requirements
After regeneration, confirm that:
- every puzzle is between `12x12` and `17x17`
- every puzzle has `30-50` clues
- every answer appears only once within that puzzle
- every clue maps to exactly one answer
- there are no split or `See X` clues
- every white cell is connected
- every entry is continuous across or down
- clue punctuation that matters to solving is preserved
- date ordering matches the manifest

## Mobile UX requirements
- Grid remains usable on a phone.
- Tap targets are comfortable.
- Active cell and active clue are obvious.
- Text is readable without zooming.
- Layout does not depend on hover.
- Keyboard, clue row, and grid should not fight for space.
- Victory/navigation actions should be easy to tap.

## Data rules
Keep crossword puzzle data separate from UI logic where practical.
Crossword data should define:
- puzzle id
- title
- optional subtitle/intro
- grid
- across clues
- down clues
- answers
- optional completion message

Do not remove, rewrite, or rename approved clues, answers, or puzzle data unless explicitly instructed.

## Implementation rules
- Make the minimum required changes to satisfy the task.
- Preserve existing crossword behaviour unless a change is requested.
- Do not redesign unrelated screens or global app navigation.
- Reuse existing crossword components and utilities where sensible.
- Keep the crossword mobile-first.
- Keep the app's gothic, personal, funny birthday tone.
