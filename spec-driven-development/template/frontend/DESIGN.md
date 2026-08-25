# Design — Weather panel

## Visual world

Petroleum observation deck: deep teal structure, mist-gray workspace, solar gold accents. The panel reads like a concise instrument, not a generic weather widget.

## Palette

- Petroleum `#163f4b` — primary structure, submit button
- Mist `#edf3f4` — page background
- Solar `#f4c95d` — accents, focus rings, temperature highlight
- Ink `#0f303a` / slate neutrals — text hierarchy

## Composition

Split layout on large screens: branded intro column left, search + result workspace right. Search stacks on narrow viewports. Result card leads with location and current temperature, then condition and three metrics.

## Accessibility

Persistent labels, `aria-live` for loading, `role="alert"` for errors, visible `:focus-visible`, English copy, metric units only.
