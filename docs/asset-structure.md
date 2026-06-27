# Asset Structure

## Core rules
- Store image paths in game data where practical.
- Use lowercase kebab-case filenames.
- Do not rename assets unless all references are updated.
- Preserve poster aspect ratios.
- Do not stretch posters.
- Do not crop important review text.
- Show a clear missing-image state rather than a broken layout.

## Current repo locations
- `public/images/games/movie-review-guess/reviews/`
  Active Letterboxd-style review screenshot directory for Movie Review Guess.
- `public/images/games/movie-review-guess/posters/`
  Poster-answer assets for Movie Review Guess.
- `public/images/games/who-liked-it-better/posters/`
  Poster assets for Who Liked It Better.
- `public/images/games/who-liked-it-better/source-images/`
  Optional celebrity/source evidence images for Who Liked It Better.
- `public/guessing-reviews/`
  Legacy review screenshot copy retained temporarily while older references are phased out.
- `data/letterboxd/processed/`
  Curated Tara ratings, review text, quote excerpts, and comparison candidates generated from external Letterboxd exports.
- `public/icons/`
  App icons and manifest assets.
- `public/templates/`
  CSV templates for admin/content import flows.

## Data locations tied to assets
- `src/features/guessing/seed/placeholder-guessing.ts`
  Current review-image mappings for the Movie Review Guess game.
- `src/features/who-liked-it-better/seed/placeholder-who-liked-it-better.ts`
  Current poster and optional source-image mappings for Who Liked It Better.
- `src/features/crossword/seed/`
  Crossword source content and clue-bank data.

## Recommended game asset locations for new work
When adding poster-heavy games or expanding existing ones, prefer:
- `public/images/games/movie-review-guess/reviews/`
- `public/images/games/movie-review-guess/posters/`
- `public/images/games/who-liked-it-better/posters/`
- `public/images/games/who-liked-it-better/source-images/`

If a Who Liked It Better round has a supplied celebrity/source image, store its path in data and render it rather than silently ignoring it.

Keep the file names in game data, not hard-coded directly into UI components.

## Review-image handling
- Review screenshots must remain readable on mobile.
- Do not place controls over the review image.
- Avoid aggressive cropping.

## Poster handling
- Preserve original poster proportions.
- Long titles should not force poster-card distortion.
- If a poster is missing, show a stable fallback state rather than collapsing the layout.

## Letterboxd source-image handling
- Celebrity/source screenshots are evidence assets, not decorative filler.
- Keep them readable enough that the player can understand why they are shown.
- Do not crop out the text that supports the rating/opinion.
