# Who Liked It Better?

## Core model
The player sees a movie and guesses who rated it higher: Tara or a celebrity.

Each question includes:
- Movie poster.
- Movie title.
- Tara option.
- Celebrity option.
- Celebrity name.
- Celebrity image where available.
- Rating reveal after guessing.

The game should feel like a gothic cinema face-off, not a form or quiz module.

## Layout
Expected mobile layout:
- Top row with back/navigation and progress.
- Movie poster.
- Movie year/category tags if available.
- Movie title.
- Prompt: `Who liked it better?`
- Two side-by-side answer cards:
  - Tara
  - Celebrity

The player should never need to scroll to interact with core game elements.

Core game elements that must stay visible/reachable:
- movie poster/title
- both answer choices
- result feedback after guessing
- `Next` action after guessing

## Answer cards
Tara and the celebrity should be presented as equal side-by-side choices.

Expected behaviour:
- Each answer card is a large tappable button.
- Celebrity card uses the celebrity image where available.
- Tara card may use a Tara image, avatar, initials, or styled placeholder depending on available assets.
- The selected card should have a clear pressed/selected state.
- Cards must be easy to tap on mobile.

Avoid stacked full-width buttons unless the viewport is too narrow to support side-by-side cards safely.

## Guess interaction
When the player taps an answer:
- Disable further guessing.
- Determine whether the choice is correct.
- Immediately open a result modal/dialog.
- Do not render the result below the fold as the main feedback mechanism.

## Result modal
Correct/wrong feedback must appear in a modal or dialog.

The modal should show:
- Correct or wrong state.
- Who liked the movie better.
- Tara’s rating.
- Celebrity rating.
- Celebrity name.
- Celebrity image if available.
- `Next` or `See Results` action.

The user should not need to scroll to see the result or continue.

Suggested copy style:
- `You ate.`
- `No crumbs.`
- `Taste detected.`
- `Cinema literacy: confirmed.`
- `Letterboxd could never.`
- `Tara supremacy confirmed.`
- `Not very slay.`
- `The vibes were incorrect.`

Avoid dry copy such as:
- `Answer submitted.`
- `Correct answer selected.`
- `Progress updated.`

## Rating reveal
After every guess, reveal:
- Tara’s rating.
- Celebrity rating.
- Who rated it higher.
- Optional explanation if provided in data.

Example:

```text
Tara: 2.5 stars
Kid Cudi: 5.0 stars

Kid Cudi liked it better.
```

## Ties
Avoid tie data unless the game includes a visible `Tie` option.

If there is no tie option:
- Do not include tied rating comparisons.
- Do not silently force a tie into Tara or celebrity.

## Rounds
The game can contain multiple movie questions.

Expected behaviour:
- Show current progress, e.g. `1/10`.
- Move one question at a time.
- Do not reveal future answers early.
- Preserve progress if persistence exists.
- Mark the game complete only after the final question/result screen.

## Final results screen
After the last question, show:
- Result title.
- Short personal/slangy message.
- Score or summary.
- List of movie outcomes if useful.
- Primary action: `Next Puzzle` if available.
- Secondary action: `Back to Home`.

## Movie poster
The poster is required for each question.

Expected behaviour:
- Display poster prominently.
- Preserve poster aspect ratio.
- Do not stretch or crop awkwardly.
- Rebalance poster size if needed so answer cards and core actions remain usable without scrolling.
- If poster is missing, show a clear missing-image state.

## Data rules
Each question should define:
- id
- movie title
- year
- poster image path
- Tara rating
- celebrity name
- celebrity rating
- celebrity image path if available
- correct answer
- optional explanation

Example:

```typescript
{
  id: "punch-drunk-love-kid-cudi",
  movieTitle: "Punch-Drunk Love",
  year: 2002,
  posterImage: "/images/games/who-liked-it-better/posters/punch-drunk-love-poster.jpg",
  taraRating: 2.5,
  celebrityName: "Kid Cudi",
  celebrityImage: "/images/games/who-liked-it-better/celebrities/kid-cudi.jpg",
  celebrityRating: 5,
  correctAnswer: "celebrity",
  explanation: "Kid Cudi liked it better."
}
```

## Mobile requirements
- No scrolling should be required for core gameplay.
- Poster, title, answer cards, modal feedback, and next action should fit comfortably on a phone.
- Tara and celebrity answer cards are large and easy to tap.
- Celebrity image is visible but not so large that it pushes controls off-screen.
- Result modal must be immediately visible after answering.
- `Next` action must be visible inside the modal.
- Preserve the dark/gothic visual style.
