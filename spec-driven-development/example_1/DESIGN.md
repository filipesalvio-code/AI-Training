# Weather now

## Direction

Operational interface for quick current-weather lookups. The composition uses a petroleum-blue guidance column and a light surface to focus the task, avoiding the overloaded dashboard pattern.

## Visual system

- Petroleum blue (`#163f4b`) drives navigation and primary controls.
- Mist-blue background (`#edf3f4`) separates the task from the introductory block.
- Solar yellow (`#f4c95d`) signals identity, focus, and temperature highlight.
- Avenir Next, Avenir, or Trebuchet MS define the typographic voice, with strong weights for titles and metrics.
- Soft borders, broad shadows, and 12 to 16 px corners define interaction surfaces.

## Behavior

The form remains editable, announces loading and errors through live regions, and removes the previous result when a new lookup begins. On narrow screens, the introductory column comes before the lookup, and controls take up the available width.

## Accessibility

All controls have persistent labels, visible focus, messages associated via `aria-describedby`, `aria-invalid` for invalid input, and `aria-busy` during lookup. Results and attribution use text, not only color or icon.
