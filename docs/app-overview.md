# App Overview

## Product
This is a personalised mobile-first birthday puzzle app for Tara's 30th birthday.
The experience should feel personal, funny, handmade, gothic/dark, romantic, celebratory, and slightly cheeky.

Avoid:
- corporate or dashboard-like UI
- generic SaaS patterns
- childish or over-bright party styling
- over-designed landing-page aesthetics

## Primary user
Tara, playing on her phone.

## Core flow

```text
Home -> choose game/puzzle -> play -> complete -> victory/reward -> next puzzle or Home
```

## Home layout
- The mobile home screen should be a vertical stack of game-type sections.
- Each section represents one game type:
  - Crossword
  - Connections
  - Movie Review Guess
  - Who Liked It Better
- Inside each section, show a horizontally scrollable row of the available individual games for that type.
- Do not collapse everything into one mixed carousel of top-level game types.
- The individual cards are the tappable entry points.
- Keep the section headings visible and the card rows swipeable on mobile.
- Avoid extra landing-page copy or marketing-style intro fluff above the lists.

## Current/planned game types
1. Crossword
2. Connections
3. Movie Review Guess
4. Who Liked It Better?

## Current intended shape of Movie Review Guess
- 3 rounds: `Easy`, `Medium`, `Hard`
- each round uses one Letterboxd-style review screenshot
- each round shows 4 movie options in a single horizontal row
- each round allows 2 incorrect guesses before failure
- after all 3 rounds, the player sees a dedicated final victory screen

## Tone
Use playful, personal, Gen Z / Gen Alpha copy where appropriate.

When a correct answer maps to a real Tara Letterboxd review, it is good to use Tara's own words as part of the reveal or celebration copy.

Good direction:
- `Slay.`
- `You ate.`
- `No crumbs.`
- `Actually iconic.`
- `Taste detected.`
- `Cinema literacy: confirmed.`
- `Tara supremacy confirmed.`

Avoid dry or corporate messaging.

## Navigation rules
- Do not add new top-level routes unless requested.
- Preserve puzzle progress when navigating back where practical.
- Refreshing should not break the current state.
- If a next puzzle exists after completion, route directly to it.
- If no next puzzle exists, `Back to Home` should be the primary completion action.

## Visual direction
- Dark, gothic, romantic, slightly dramatic.
- Handmade and personal, not sterile.
- Celebratory, but not generic party-app styling.

## Mobile-first rules
- Comfortable tap targets.
- Readable text without zooming.
- No hover-dependent interactions.
- Game interactions should feel fast and low-friction.
- Home should feel browseable at a glance:
  - vertical scan by game type
  - horizontal swipe within each game-type row
