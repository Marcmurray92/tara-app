# QA Quality Gate

Before marking a task complete, check the work against these rules.

## Project fit
- The app still feels like a personalised mobile-first birthday puzzle app.
- The tone remains personal, funny, handmade, gothic/dark, celebratory, and slightly cheeky.
- The change supports the puzzle experience rather than adding unrelated polish.

## Mobile-first UX
- Check the feature at a phone-sized viewport.
- Tap targets are comfortable.
- Text is readable without zooming.
- Layouts do not rely on desktop spacing or hover interactions.
- Puzzle interactions remain fast, clear, and low-friction.

## Puzzle behaviour
- Existing puzzles still load.
- Starting, resuming, completing, and refreshing behave as expected.
- Completion, locked, and unlocked states remain clear.
- User progress is not accidentally reset unless the task explicitly requires it.
- Puzzle data remains separate from UI logic where practical.

## Content and assets
- Use provided content, clue lists, image names, and asset mappings as source of truth.
- Do not rename image files unless all references are updated.
- Images appear in the intended locations.
- Images are responsive and not awkwardly stretched, cropped, or distorted.
- New copy matches the personal, gothic, funny tone.

## Verification
Run the most relevant available checks:
- build check
- type check if TypeScript is used
- lint check if configured
- test command if tests exist
- local smoke test if possible

If a check cannot be run, state that clearly and explain why.
