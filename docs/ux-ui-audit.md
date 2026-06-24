# UX / UI Audit: Tara's 30th

Date: 2026-06-24
Reviewer: Codex
Baseline reviewed: `https://tara-app-production.up.railway.app/`

## Current strengths

- The app already has a coherent gift-first visual direction with warm accent color, strong contrast, and differentiated game routes.
- All three public games are playable and save progress locally.
- Crossword supports hardware keyboard input and preserves progress through reload.
- Connections uses the correct tap-to-select interaction model and already prevents over-selection.
- Guessing Game uses a simple, readable multiple-choice flow with immediate answer feedback.
- Public routes are already grouped inside a shared shell, which makes consistency improvements achievable without major rewrites.

## Findings

| Area | Issue | Priority | Recommendation | Fixed in this pass |
| --- | --- | --- | --- | --- |
| Shared shell | Game routes inherit the full public shell with a sticky branded header, large page padding, and footer copy that push active gameplay too far below the fold on mobile. | critical | Introduce a more compact game-route shell, reduce vertical chrome, and remove footer from active game routes. | yes |
| Shared shell | `100vh` is used in layout and body sizing, which is fragile on mobile browsers with dynamic UI chrome. | high | Move to `100dvh` with safe-area-aware spacing utilities. | yes |
| Shared shell | Mobile navigation is unclear because the desktop nav disappears and compact screens have no obvious return action while inside a game. | high | Provide a visible labelled Home return control on compact screens. | yes |
| Visual hierarchy | Top intro cards on Crossword, Connections, and Guessing are visually oversized relative to the active board/question. | critical | Replace large hero-like sections with compact game mastheads. | yes |
| Crossword | The grid is not dominant enough on mobile because the title card, clue card, and toolbar sit above or around it with generous padding. | critical | Tighten masthead spacing, reduce grid framing, and demote secondary controls. | yes |
| Crossword | The current clue is useful but presented as a full card instead of a compact persistent solve strip. | high | Convert it into a denser clue strip with strong clue metadata and adjacent controls. | yes |
| Crossword | The mobile experience lacks a visible touch-first letter keyboard, forcing reliance on hidden input behaviour. | critical | Add a persistent touch keyboard while retaining hardware keyboard support. | yes |
| Crossword | Full clue lists and full solve toolbar stay permanently expanded on small screens, creating long scroll-heavy pages. | high | Collapse secondary clue lists and assist controls on compact screens. | yes |
| Crossword | There is no obvious visible direction indicator beyond clue text. | medium | Surface direction more clearly in the current clue strip and keyboard area. | yes |
| Connections | Status, instructions, and controls are separated too far from the tile board, especially on mobile. | high | Pull status and primary actions closer to the board and demote explanatory copy. | yes |
| Connections | “How it works” content competes with gameplay on smaller screens. | medium | Collapse helper content behind a compact disclosure on mobile. | yes |
| Guessing | The question card is not visually dominant enough because the intro/status card claims too much space above it. | high | Use a smaller masthead and keep question progress tightly grouped with the active prompt. | yes |
| Guessing | Secondary cards such as “Round feel” and restart controls are too prominent on mobile. | medium | Collapse secondary information on small screens and keep restart available but lower priority. | yes |
| Accessibility | Primary controls generally have acceptable sizing, but repeated small ghost buttons and compressed metadata reduce clarity in dense game sections. | medium | Standardize clearer compact controls and keep touch targets at or above practical minimums. | partially |
| Accessibility | The crossword active state relies heavily on color, even though border and revealed dot indicators help. | medium | Preserve border emphasis and keep active clue/direction text adjacent to reduce ambiguity. | partially |
| Performance | No severe interaction delays were observed in quick manual review, but the most obvious UX cost is layout depth rather than raw latency. | low | Prefer structural simplification before deeper render optimization. | no change needed |
| Analytics | Event taxonomy from the brief is not yet implemented consistently across the public game interactions. | low | Define or implement event names in a later pass once UX structure is settled. | no |

## Responsive review notes

Observed against the requested baseline sizes, with emphasis on the current production deployment:

- `360 × 800`: active gameplay is most cramped here; Crossword is most affected by top chrome.
- `390 × 844`: public shell feels homepage-first on game pages; controls often sit below the first viewport.
- `430 × 932`: still mobile-first; large cards are less harmful but gameplay should remain the dominant element.
- `768 × 1024`: layouts are mostly stable, but mobile-secondary content should still stay collapsible.
- `1024 × 768`: shared shell works, though Crossword clue and board balance benefits from tighter spacing.
- `1440 × 900`: desktop has enough room; improvements should preserve persistent clue/status side content where useful.

## Interaction and behavioural notes

- Reload persistence is already working for Crossword, Connections, and Guessing.
- Connections immediate selection feedback is good and should be preserved.
- Guessing immediate answer feedback is good and should be preserved.
- Crossword hardware keyboard support is already valuable and should remain intact while touch input improves.
- Secondary destructive actions in Crossword already use confirmation dialogs and should remain confirmed.

## Scope intentionally left for later

- Deeper crossword hint architecture such as progressive bottom-sheet hints.
- A full bottom-sheet clue browser for mobile Crossword instead of lighter collapsible sections.
- Full analytics taxonomy implementation from the brief.
- Dedicated performance instrumentation and bundle analysis.
- Expanded Guessing modes beyond the current multiple-choice route.

## Verification completed in this pass

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

Notes:

- Manual baseline review was performed against the live Railway deployment before implementation.
- A final local browser capture attempt was partially limited by the in-app browser viewport tooling in this environment, so build/test validation was used as the deploy gate after the UI changes landed.
