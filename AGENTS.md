# AGENTS.md

## Project context
This is a personalised mobile-first birthday puzzle app for my wife Tara's 30th birthday.
The app should feel personal, funny, handmade, gothic/dark, romantic, celebratory, and slightly cheeky.
The app should not feel corporate, generic, over-designed, childish, ad-heavy, productivity-tool-like, or like a generic gamified SaaS app.

## Primary user
Tara, using the web app on her phone.

## Core experience
Home -> choose game/puzzle -> play -> complete -> victory/reward -> next puzzle or Home.

## Game types
The app has 5 game types:
1. Crossword
2. Connections
3. Movie Review Guess
4. Who Liked It Better?
5. Colour Field

For game-specific rules, read the relevant file in `docs/games/`.

## Product tone
Use playful, personal, Gen Z / Gen Alpha style copy where appropriate.

Acceptable copy direction:
- `Slay.`
- `You ate.`
- `No crumbs.`
- `Slay queen.`
- `Main character behaviour.`
- `Actually iconic.`
- `Ate and left no crumbs.`
- `That was giving genius.`
- `Taste detected.`
- `Cinema literacy: confirmed.`
- `Letterboxd could never.`
- `Tara supremacy confirmed.`

Avoid dry corporate copy such as:
- `Task completed successfully.`
- `User has completed this module.`
- `Your progress has been recorded.`
- `Congratulations on completing this activity.`

## Visual direction
The aesthetic should remain dark, gothic, romantic, and slightly dramatic.
Celebratory elements are allowed, but they should not push the app into bright generic party styling.
Avoid generic SaaS patterns, dashboard-style UI, unnecessary stats, bland cards, and overly clean corporate visuals.
Avoid "saas landing page" layouts. This is a game.

## Minimum required change rule
Make the minimum required changes to satisfy the task.
Do not redesign unrelated screens, restructure working code, introduce new patterns, or add dependencies unless the requirement cannot be met without doing so.
Prefer small, focused edits over broad refactors.
If a requirement includes additional configuration details or changes that should be reflected in the deployment guide, update the relevant `.md` file.

## Project docs
Before making changes, read the relevant docs if they exist:
- `docs/app-overview.md` for product, tone, navigation, and home screen rules.
- `docs/asset-structure.md` before adding, renaming, moving, or referencing images.
- `docs/letterboxd-data.md` before changing review-driven, rating-driven, or celebrity-comparison content.
- `docs/qa-quality-gate.md` before marking work complete.
- `docs/deployment-railway.md` before touching build, start, ports, env vars, routing, asset paths, or server config.
- `docs/games/crossword.md` before changing the Crossword game.
- `docs/games/connections.md` before changing the Connections game.
- `docs/games/movie-review-guess.md` before changing the Movie Review Guess game.
- `docs/games/who-liked-it-better.md` before changing the Who Liked It Better game.
- `docs/games/colour-field.md` before changing the Colour Field game.

If a referenced doc does not exist, follow this file and make conservative, minimal changes.

## Navigation rules
Expected flow:

```text
Home -> choose game/puzzle -> play -> complete -> victory/reward -> next puzzle or Home
```

Rules:
- Do not add new top-level routes unless requested.
- Back navigation should not unexpectedly lose puzzle progress.
- Refreshing should not break the current puzzle state.
- Do not send the player to a locked puzzle without explanation.
- If a next puzzle is available after victory, route directly to it.
- If no next puzzle is available, use `Back to Home` as the primary action.

## Asset rules
Before adding, renaming, moving, or referencing images, read `docs/asset-structure.md`.

General rules:
- Store image paths in game data where practical.
- Use lowercase kebab-case filenames.
- Do not rename image files unless all references are updated.
- Preserve poster aspect ratios.
- Do not stretch posters.
- Do not crop important review text.
- Show a clear missing-image state rather than a broken layout.

## Data rules
Keep content/data separate from UI logic where practical.
Store clues, answers, image paths, ratings, celebrity names, review data, and poster options in game data rather than hard-coding them directly into components.
Use `docs/letterboxd-data.md` for raw-vs-processed rules when touching Letterboxd exports, Tara reviews, or celebrity comparison data.

## Mobile UX rules
The app is mobile-first.
Before finishing UI changes, check at a phone-sized viewport.

Requirements:
- Tap targets are comfortable.
- Text is readable without zooming.
- Puzzle interactions are fast and low-friction.
- Layouts do not rely on desktop spacing.
- Interactions do not depend on hover.
- Poster images remain readable and undistorted.
- Review screenshots remain readable.
- Victory and navigation buttons do not require precision tapping.

## Accessibility rules
Where practical:
- Interactive tiles, posters, and answer options should be real buttons.
- Disabled states should be programmatically disabled.
- Feedback should appear clearly in the reading order.
- Keyboard behaviour should not be made worse.

## Scope control
- Only change files needed for the requested task.
- Do not redesign unrelated screens, flows, components, or data structures.
- Do not remove existing clues, answers, puzzles, routes, copy, or assets unless explicitly instructed.
- Do not introduce large new dependencies without explaining why they are necessary.
- Do not rewrite working logic just to make it neater.

## Code quality
- Follow the existing project structure and coding style.
- Prefer simple, readable code over clever abstractions.
- Reuse existing components and utilities where sensible.
- Avoid duplicated hard-coded values where a clear data structure exists.
- Do not over-engineer for hypothetical future games unless requested.

## Deployment
This app is deployed on Railway.
Before changing build scripts, start commands, ports, environment variable handling, routing, asset paths, or server configuration, read:
- `docs/deployment-railway.md`

Do not "fix" Railway deployment by guessing.
Preserve documented build/start behaviour unless the task explicitly asks for a deployment change.
If deployment behaviour is touched, mention it in the final summary.

## Quality gate
Before marking a task complete, check the work against these rules.

### Project fit
- The app still feels like a personalised mobile-first birthday puzzle app.
- The tone remains personal, funny, handmade, gothic/dark, celebratory, and slightly cheeky.
- The change supports the puzzle experience rather than adding unrelated polish.

### Mobile-first UX
- Check the feature at a phone-sized viewport.
- Tap targets are comfortable.
- Text is readable without zooming.
- Layouts do not rely on desktop spacing or hover interactions.
- Puzzle interactions remain fast, clear, and low-friction.

### Puzzle behaviour
- Existing puzzles still load.
- Starting, resuming, completing, and refreshing behave as expected.
- Completion, locked, and unlocked states remain clear.
- User progress is not accidentally reset unless the task explicitly requires it.
- Puzzle data remains separate from UI logic where practical.

### Content and assets
- Use provided content, clue lists, image names, and asset mappings as source of truth.
- Do not rename image files unless all references are updated.
- Images appear in the intended locations.
- Images are responsive and not awkwardly stretched, cropped, or distorted.
- New copy matches the personal, gothic, funny tone.

### Verification
Run the most relevant available checks:
- build check
- type check if TypeScript is used
- lint check if configured
- test command if tests exist
- local smoke test if possible

If a check cannot be run, state that clearly and explain why.

## Final response requirements
When finished, summarise:
- what changed
- which files were touched
- how the quality gate was checked
- any assumptions or follow-up risks
- any checks that could not be run
