# Letterboxd Data

## Purpose
This project uses Tara's Letterboxd export data plus curated celebrity ratings/review images to power:
- Movie Review Guess
- Who Liked It Better
- celebratory quote/reveal copy tied to correct answers

## Source-of-truth order
Use sources in this order:
1. Tara's raw Letterboxd export for Tara's own ratings, reviews, dates, and titles
2. explicit celebrity ratings supplied by Marc
3. attached celebrity/source images
4. low-confidence inferred celebrity ratings, only when clearly marked as inferred

Do not invent Tara ratings, Tara review text, or watch dates.

## Storage model
Raw exports and curated app data should stay separate.

Recommended layout:

```text
data/
  letterboxd/
    raw/
      tara/
        ratings.csv
        reviews.csv
        diary.csv
    processed/
      tara-ratings.json
      tara-reviews.json
      tara-review-quotes.json
      who-liked-it-better-candidates.json
```

## Asset layout
Keep image evidence out of the raw data folders.

Recommended runtime asset locations:
- `public/guessing-reviews/`
  Current Letterboxd-style screenshots already used by Movie Review Guess
- `public/images/games/movie-review-guess/posters/`
  Poster answers for the poster-grid version
- `public/images/games/who-liked-it-better/posters/`
  Movie posters for comparison rounds
- `public/images/games/who-liked-it-better/source-images/`
  Optional celebrity/source evidence images, e.g. Kanye screenshots

## Matching rules
- Match Tara titles against the export using title first and year second where possible.
- Preserve the Letterboxd export title in processed data.
- Add a slug for app usage, but do not treat the slug as the source of truth.
- If a Tara rating is missing from the export, mark the candidate unresolved instead of guessing.
- If a celebrity rating is image-inferred rather than source-backed, store:
  - `ratingSource`
  - `ratingConfidence`
  - `needsReview`

## Review quote rules
Tara's review text can be reused as delight copy only when it belongs to the correct movie answer.

Good uses:
- correct-answer reveal copy
- final round celebration copy
- post-win summary lines

Rules:
- keep the original meaning intact
- prefer short excerpts over long paragraphs
- preserve Tara wording unless the UI needs trimming
- if the review is long, store both the full review and a shorter celebration-ready excerpt

## Who Liked It Better rules
For comparison data:
- every playable question needs a Tara rating and a celebrity rating
- avoid ties unless the game explicitly supports a tie answer
- if a source image exists for the celebrity/movie pairing, store the public image path and show it in the game
- keep unresolved candidates in processed data so they can be finished later

## Processed data expectations

### `tara-ratings.json`
Should contain:
- title
- year
- slug
- rating
- rated date
- Letterboxd URI

### `tara-reviews.json`
Should contain:
- title
- year
- slug
- rating if present
- raw review text
- cleaned review text
- watched date
- Letterboxd URI

### `tara-review-quotes.json`
Should contain short, reusable excerpts keyed to the movie slug.

### `who-liked-it-better-candidates.json`
Should separate:
- ready questions
- provisional inferred questions
- unresolved candidates

Each candidate should record why it is ready or blocked.
