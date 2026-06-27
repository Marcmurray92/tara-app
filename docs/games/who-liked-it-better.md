# Who Liked It Better

## Who Liked It Better Interactions

### Core model
The player sees a movie and guesses who rated it higher: Tara or a celebrity.
Each question should include:
- Movie poster.
- Movie title.
- Tara option.
- Celebrity option.
- The celebrity name, e.g. Kanye, Martin Scorsese, or another configured celebrity.
- Rating reveal after guessing.

If a source image exists for the celebrity/movie pairing, show it.

Use the exact celebrity names provided in the game data.

### Layout
Expected mobile layout:
- Top row with back/navigation and progress.
- Movie poster.
- Movie title.
- Prompt: `Who liked it better?`
- Two large answer buttons:
  - `Tara`
  - celebrity name
- Optional celebrity/source image if supplied
- Feedback/reveal area after guessing.

### Guess interaction
When the player taps an answer:

Correct guess:
- Mark the selected answer as correct.
- Reveal both ratings.
- Show short success copy.
- Disable further guessing.
- Show `Next` or `See Results`.

Incorrect guess:
- Mark the selected answer as incorrect.
- Reveal both ratings.
- Show short failure copy.
- Disable further guessing.
- Show `Next` or `See Results`.

### Rating reveal
After every guess, reveal:
- Tara's rating.
- Celebrity rating.
- Who rated it higher.
- Optional short explanation if provided in data.

Example reveal structure:

```text
Tara: 4.5
Scorsese: 2.0

Tara liked it better.
```

### Ties
If Tara and the celebrity gave the same rating:
- Treat the correct answer as `Tie` only if the game includes a visible tie option.
- If there is no tie option, avoid tie data.
- Do not silently force a tie into Tara or celebrity.

### Rounds
The game can contain multiple movie questions.

Expected behaviour:
- Show current progress, e.g. `2/10`.
- Move one question at a time.
- Do not reveal future answers early.
- Preserve progress if persistence exists.
- Mark the game complete only after the final question/result screen.

### Final results screen
After the last question, show:
- Result title.
- Short personal/slangy message.
- Score or summary.
- List of movie outcomes if useful.
- Primary action: `Next Puzzle` if available.
- Secondary action: `Back to Home`.

Suggested copy style:
- `You ate.`
- `No crumbs.`
- `Taste detected.`
- `Main character behaviour.`
- `Cinema literacy: confirmed.`
- `Tara supremacy confirmed.`

### Movie poster
The poster is required for each question.

Expected behaviour:
- Display poster prominently.
- Preserve poster aspect ratio.
- Do not stretch or crop awkwardly.
- If poster is missing, show a clear missing-image state.

### Optional celebrity/source image
If a round has a supplied source image:
- render it as part of the question or reveal
- keep the image readable
- do not hide it behind an extra tap if there is space to show it
- do not treat it as decorative only

### Data rules
Each question should define:
- id
- movie title
- poster image path
- Tara rating
- celebrity name
- celebrity rating
- correct answer
- optional explanation
- optional source image path
- optional source image alt text
- rating source metadata if the celebrity rating is provisional or inferred

Example:

```text
{
  id: "goodfellas-scorsese",
  movieTitle: "Goodfellas",
  posterImage: "/images/games/who-liked-it-better/posters/goodfellas-poster.jpg",
  taraRating: 4.5,
  celebrityName: "Martin Scorsese",
  celebrityRating: 5,
  correctAnswer: "celebrity",
  explanation: "Scorsese backed himself here, unsurprisingly."
}
```

### Mobile requirements
- Poster is readable but does not push answer buttons too far down.
- Tara and celebrity answer buttons are large and easy to tap.
- Rating reveal is clear.
- Next/result actions are easy to reach.
