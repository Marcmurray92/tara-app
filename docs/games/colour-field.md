# Colour Field

## Purpose
Colour Field is the fifth game type in Tara's birthday app.
It is an original colour-gradient restoration puzzle inspired by the broad interaction category of games like I Love Hue, but it must remain its own thing.

## Product fit
- Keep it calm, tactile, mobile-first, and a little dramatic.
- It should feel handmade and satisfying, not like a sterile logic trainer.
- Copy can be playful, but the colour puzzle should stay visually in charge.

## Core loop
1. Show the solved colour field briefly.
2. Scramble only the movable tiles.
3. Keep fixed anchor tiles locked in place.
4. Let the player swap tiles until the gradient is restored.
5. Count moves.
6. Celebrate completion, then offer the next field.

## MVP interaction model
- Tap a tile to select it.
- Tap another movable tile to swap them.
- Tap the selected tile again to cancel selection.
- Tapping outside the board should also cancel selection where practical.
- Dragging is optional polish and is not required for the MVP.

## Board rules
- Use square grids.
- Start easy and ramp up gradually.
- Fixed anchor tiles should be visually distinct and immovable.
- Movable tiles should always be real buttons.
- The solved state is when every tile is back in its intended position.

## Release shape
- A single seeded pack is fine for now.
- Target roughly 12 to 15 levels.
- Increase complexity from 4x4 boards upward.
- Seeded fields should not dip below 16 tiles.
- Keep the board sizes phone-friendly.

## Colour rules
- Prefer perceptually smooth interpolation.
- Oklab or OkLCh-style interpolation is preferred over naive RGB interpolation.
- Avoid muddy transitions where possible.
- Keep the palettes romantic, gothic, dreamy, nocturnal, or celebratory rather than generic neon app styling.
- Do not let the whole pack collapse into near-identical purple gradients.
- The seeded pack should visibly span a mix of blush, blue, smoke, amber, moss, teal, wine, and plum tones while staying moody.

## Mobile UX
- The board should be the focus.
- The player should not need to scroll just to interact with the puzzle.
- Keep chrome light:
  - title
  - move count
  - restart
  - back
- Completion feedback should appear in a modal/dialog, not below the fold.

## Progress
- Save progress locally.
- Save completion state per field.
- Save best move count per field.
- Unlock later fields in a clear and simple way.

## Completion flow
On completing a field:
- show a short celebratory line
- show move count
- show best move if available
- offer:
  - `Next field` when another one exists
  - `Replay`
  - `Back to pack`

If the final field in the pack is complete:
- keep the pack marked complete
- offer `Back to Home` as a primary fallback action

## Copy direction
Good lines:
- `Field restored.`
- `Beautifully balanced.`
- `That one sings.`
- `Very you.`
- `No crumbs in this gradient.`

Avoid:
- corporate scoring language
- dashboard-style stats overload
- generic tutorial filler

## IP guardrail
- Do not use I Love Hue branding, naming, artwork, audio, or exact UI copy.
- It is okay to borrow the abstract mechanic of restoring a scrambled gradient through tile swapping.
