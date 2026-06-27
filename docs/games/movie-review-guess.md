# Movie Review Guess

## Interactions

### Core interaction model
The movie review guessing game has 3 rounds: Easy, Medium, and Hard.

Each round presents:
- A Letterboxd-style review screenshot at the top.
- A single-row set of 4 movie poster options underneath.
- A mistake counter for the current round.

The player wins a round by selecting the poster for the movie that matches the review.

### Round structure
Each game contains 3 review rounds:
1. Easy
2. Medium
3. Hard

Expected flow:
1. Show the round label, e.g. `Easy`, `Medium`, or `Hard`.
2. Show the review screenshot.
3. Show 4 poster options in one horizontal row.
4. Player selects one poster.
5. If correct, show round success feedback.
6. Move to the next round.
7. After all 3 rounds are solved, show the final victory screen.

### Mistakes
Each round allows 2 incorrect guesses.

Expected behaviour:
- Each round starts with `2 mistakes remaining`.
- An incorrect poster guess reduces the counter by 1.
- A correct guess immediately completes the round.
- Mistakes reset at the start of each new round.
- The mistake counter should be visible while guessing.
- If mistakes reach 0, the round is failed and the correct answer is revealed.

### Poster selection
Each poster acts as a single answer button.

#### Correct guess
When the player taps the correct poster:
- Mark the selected poster as correct.
- Disable further guesses.
- Reveal or confirm the movie title.
- If a short Tara review quote exists for that movie, it can appear as bonus delight copy.
- Show short success feedback.
- Show `Next Round`, or `See Results` after the Hard round.

#### Incorrect guess
When the player taps an incorrect poster:
- Mark the selected poster as incorrect.
- Reduce mistakes remaining by 1.
- Disable that poster so it cannot be selected again.
- Keep the remaining posters playable.
- Do not reveal the correct answer unless mistakes reach 0.

### Failed round
If the player runs out of mistakes:
- Disable all poster options.
- Reveal the correct movie.
- Show a short failure message.
- Offer:
  - `Try Again`
  - `Back to Home`

Suggested copy style:
- `Not very slay.`
- `The review won this round.`
- `Cinema has humbled you.`
- `No crumbs detected.`

### Review image
The review screenshot is the main clue.

Expected behaviour:
- Display it above the poster grid.
- Keep it readable on mobile.
- Scale responsively.
- Do not crop important review text.
- Do not place controls over the review.
- The main gameplay view should stay compact enough to avoid scrolling on a phone.

If the review image cannot load:
- Show a clear missing-image message.
- Do not show a playable poster grid without the clue.

### Poster grid
The answer options are shown as 4 posters in a single row.

Expected behaviour:
- Posters are tappable.
- Poster aspect ratios are preserved.
- Poster title is available for accessibility.
- Correct and incorrect states are visually distinct.
- Show only the poster and the movie title underneath each option.
- Do not add extra flavour text or clutter around the answer options.
- The grid should feel simple and quick, not like a large search task.

### Round success state
After a correct guess, show a compact modal/dialog before moving on.

Expected UI:
- Correct movie title.
- Short success message.
- Round progress, e.g. `Medium complete`.
- Primary action: `Next Round`.

After the Hard round, replace `Next Round` with `See Results`.

Suggested copy style:
- `You ate.`
- `No crumbs.`
- `Actually iconic.`
- `Letterboxd could never.`
- `That was giving genius.`

### Final victory screen
After Easy, Medium, and Hard are all completed correctly, show a dedicated victory screen.

Expected UI:
- Celebratory title.
- Short personal/slangy message.
- Summary of the 3 solved review/movie matches.
- Primary action: `Next Puzzle` if available.
- Secondary action: `Back to Home`.

Suggested structure:
- Title: `You got all 3.`
- Message: `You ate. Letterboxd could never.`
- Summary:
  - Easy: movie title
  - Medium: movie title
  - Hard: movie title
- Primary button: `Next Puzzle`
- Secondary button: `Back to Home`

### Navigation after winning
After victory:
- If another puzzle is available, `Next Puzzle` should navigate directly to it.
- If no next puzzle is available, use `Back to Home` as the primary action.
- Do not send the player to a locked puzzle without explanation.

### Navigation during play
The player may leave the game at any point.

Expected behaviour:
- Home/navigation links remain available.
- Returning to the game should preserve progress if persistence exists.
- If progress is not persisted, do not imply that it is.

### Blank/loading state
Use a blank state if review data, poster data, or images are missing.

Expected missing-data state:
- Explain that the round cannot be loaded.
- Provide `Back to Home`.
- Do not render an empty poster grid as if playable.

Example copy style:
- `This review has vanished into the gothic mist.`
- `The vibes failed to load.`
- `This round is missing. Suspicious.`

### Mobile UX expectations
- Review image remains readable.
- The 4-poster row fits comfortably on a phone without needing page scroll.
- Poster buttons are large enough to tap.
- Mistake count and round label are easy to see.
- Primary actions are easy to reach.
- Avoid hover-only behaviour.
- Preserve poster aspect ratios.

### Accessibility expectations
- Poster options should be buttons.
- Each poster button should have an accessible movie title.
- Correct/incorrect states should not rely on colour alone.
- Feedback should be announced or placed clearly in the reading order.
- Disabled guessed posters should be programmatically disabled.

### Recommended implementation rules
- Keep review data, correct answers, poster options, difficulty labels, and image paths in data, not hard-coded into UI components.
- Tara review quotes, if used, should come from processed Letterboxd data rather than being rewritten ad hoc in the component.
- Each round should define one correct movie and three decoys.
- Each game should define exactly 3 rounds unless explicitly configured otherwise.
- Use the round difficulty labels: `Easy`, `Medium`, `Hard`.
- Do not duplicate poster metadata across rounds unless necessary.
- Preserve poster image aspect ratios.
- Do not reset the full game when moving between rounds.
- Do not mark the game complete until all 3 rounds are solved.
