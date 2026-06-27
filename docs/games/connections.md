# Connections

## Connections Interactions

### Core model
The player finds 4 hidden groups of 4 related tiles from a 4x4 grid.

The game should feel fast, tactile, and satisfying on mobile.

### Layout
Expected layout:

- Top row with back/navigation and puzzle status.
- 4x4 answer grid.
- Mistakes remaining row.
- Button row:
  - Shuffle
  - Deselect
  - Submit
- Avoid duplicate explanatory copy blocks under the board title unless explicitly requested.

### Tile selection
When the player taps an unselected unsolved tile:

- The tile becomes selected.
- The selected state is visually obvious.
- The tile stays in place unless shuffled.

When 4 tiles are selected:

- Further unselected tiles cannot be selected until one is deselected.
- Submit becomes active.
- The UI clearly shows the player has selected enough tiles.

### Submit button
Submit is only active when 4 tiles are selected.

The Submit button should use its background as a progress indicator:

- 0 selected: empty/inactive
- 1 selected: 25%
- 2 selected: 50%
- 3 selected: 75%
- 4 selected: full/active

### Deselect
Deselect is only active when at least one tile is selected.

Expected behaviour:

- Clears all selected tiles.
- Does not affect solved groups, mistakes, tile order, or progress.

### Shuffle
Shuffle rearranges remaining unsolved tiles.

Expected behaviour:

- Solved groups are not returned to the active grid.
- Selected state should clear on shuffle.
- Answer groups do not change.
- Mistakes, solved count, and progress do not change.

### Incorrect guess
After an incorrect submitted guess:

- The selected tiles bounce one at a time.
- Then all selected incorrect tiles briefly shake side-to-side.
- The selection remains active.
- Mistakes remaining decreases by 1.

### One-away feedback
If exactly one of the 4 selected tiles is incorrect:

- Show a small popup: `One Away...`
- The popup disappears quickly.
- Feedback appears only after submit, not during selection.

### Correct guess
When the player submits a correct group:

- The 4 selected tiles visually shoot up into a solved answer row.
- The solved row shows:
  - category title
  - 4 answers in a single comma-separated horizontal list
- The solved row uses the group's difficulty colour.
- Each group has a consistent difficulty colour.
- The solved row should be the same height as one row of the 4x4 grid, so the total layout remains stable.

### Win/loss state
The game ends when all 4 groups are solved or the player runs out of allowed mistakes.

On completion:

- Show whether the player won or lost.
- Show the guess composition as an emoji grid.
- Present the completion summary in a modal/dialog so the player does not need to scroll to see the result or continue.
- Mark the puzzle complete if the player won.
- Completion should persist after refresh if persistence exists.
- Offer:
  - `Play another Connections`
  - `Back to Home`

Copy can use playful slang such as:

- `Slay.`
- `You ate.`
- `No crumbs.`
- `Actually iconic.`
- `Main character behaviour.`
- `Tara supremacy confirmed.`

### Mobile requirements
- Tiles are large enough to tap comfortably.
- Selected state is clear.
- Long labels wrap or scale gracefully.
- Buttons are easy to tap.
- Win/loss actions do not require precision tapping.
