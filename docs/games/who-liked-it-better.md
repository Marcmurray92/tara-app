# Who Liked It Better?

## Core model
The player sees a movie and guesses who rated it higher: Tara or a celebrity.

Each playable game contains exactly 3 questions.

Every 3-question game should include:
- at least 1 Kanye question
- a mix of Tara wins and celebrity wins where practical
- real poster art
- celebrity face-off imagery where available
- optional review/source screenshots shown in the result modal

Each question includes:
- Movie poster.
- Movie title.
- Tara option.
- Celebrity option.
- Celebrity name.
- Celebrity image where available.
- Rating reveal after guessing.
- Optional source/review image shown only in the result modal where relevant.

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
- Do not use source/review screenshots as the celebrity face-off image.
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

## Progress
Progress should be shown with 3 circles, one per question.

Expected behaviour:
- unanswered future question: outlined circle
- current unanswered question: active outlined or filled circle
- correct answer: green circle with a check icon
- wrong answer: red circle with an x icon

Do not use a generic `1/10` style counter as the primary progress UI for this game.

## Result modal
Correct/wrong feedback must appear in a modal or dialog.

The modal should show:
- Correct or wrong state.
- Who liked the movie better.
- Tara’s rating.
- Celebrity rating.
- Celebrity name.
- Celebrity image if available.
- Source/review screenshot if that image is part of the joke or evidence for the round.
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

Expected presentation:
- show the ratings as horizontal stars under each name
- animate the stars in with a short stagger
- the higher rating should play slightly longer
- once the lower rating has finished animating, fade the losing side by roughly 30%
- briefly bounce the winning side

Keep the motion short, readable, and mobile-safe.

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
The game contains 3 movie questions.

Expected behaviour:
- move one question at a time
- do not reveal future answers early
- preserve progress if persistence exists
- mark the game complete only after the final question/result screen
- include at least 1 Kanye round in the 3-question set

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

## Source/review images
Some celebrity rounds, especially Kanye rounds, may include supporting review/source images.

Expected behaviour:
- keep these images out of the main face-off choice card
- show them in the result modal only
- if a round has 1 source image, render it full width
- if a round has multiple source images, render them in a horizontal scroll row
- when multiple images exist, make the first card about 80% width so the next image peeks into view
- do not crop out key review text

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
- optional celebrity source/review image path(s)
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
