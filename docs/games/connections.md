# Connections

## Core model
The player groups 16 movie titles into 4 hidden categories of 4.
The game ends when all 4 groups are solved or the player runs out of allowed mistakes.

## Board rules
- The board shows 16 movie-title tiles.
- The player can select up to 4 titles at a time.
- Submitting a correct set solves that group.
- Submitting an incorrect set uses a mistake.
- `One away` feedback is allowed when exactly 3 selected titles belong together.

## Win/loss
The game ends when:
- all 4 groups are solved, or
- the player runs out of allowed mistakes

On completion:
- show whether the player won or lost
- show the guess composition as an emoji grid
- mark the puzzle complete if the player won
- preserve completion after refresh if persistence exists
- offer:
  - `Play another Connections`
  - `Back to Home`

## Completion expectations
### Win
- Show a clear win state.
- Show the solved categories.
- Show the emoji guess grid.
- Keep the tone playful, personal, and a bit smug.

### Loss
- Show a clear loss state.
- Reveal the unsolved categories.
- Show the emoji guess grid.
- Offer a fast restart path.

## Emoji grid
Use an emoji-grid style summary of the submitted guesses.
Each row should represent one submitted guess.
Each square should reflect the category/difficulty colour for the guessed title.

The grid should be readable on mobile and feel like a share-summary style recap, even if it is not literally being shared.

## Mobile UX
- Keep the full 4x4 board visible without turning the titles into tiny, unusable tap targets.
- Tile selection should remain obvious.
- Completion actions should be easy to hit.
- The emoji recap should not feel buried.

## Data rules
- Keep groups/categories in data, not hard-coded into the component.
- Preserve the four-groups-of-four structure.
- Keep difficulty/category metadata available so the completion recap can render consistently.
