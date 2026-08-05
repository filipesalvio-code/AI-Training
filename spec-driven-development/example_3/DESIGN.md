# Weather instrument panel

## Direction

The panel treats a weather lookup as a compact instrument readout: the user enters a city, then receives a resolved location and current measurements in the same vertical field. The visual direction is the fifth grounded operational direction selected with seed `06d2db08`.

## Visual language

- Midnight slate background for use in low-light or focused work scenes.
- White and slate text for hierarchy and legibility.
- Amber carries the primary action, active measurement cue and focus relationship.
- Thin horizontal rules behave like instrument measurement marks.
- Trebuchet MS and system sans provide a practical, familiar reading voice; monospace is reserved for small instrumentation labels.
- Results use semantic document flow and measurement rows rather than decorative card grids.

## Interaction and states

The labeled city field stays available in every state. Loading replaces the prior result and disables the action. Validation is attached to the field; external errors are announced in an alert and permit retry; success exposes the resolved place, five current values, units and source attribution. Focus rings remain visible on controls and links.

## Responsive behavior

The form stacks below the small-screen breakpoint. The result changes from a two-column reading to a single-column flow, while measurement rows remain legible from 360 px upward without horizontal overflow.
