Team focus — decided from /proto/team-focus

- Direction: Page. The portrait scales up and slides to the horizontal center, then lives in the same column as the role, name, bio and studio stills. Scrolling carries the portrait away with them.
- Scale target 320px from the clicked card's center. The column starts under the navbar, so the portrait scrolls off above the content and does not pass under the mark. Move 280ms cubic-bezier(0.77, 0, 0.18, 1). Others fade in 200ms ease-in. Copy rises 200ms ease-out after 140ms; stills follow from 180ms, 40ms apart. Dismissing, with Escape or a click on the empty field, fades the words in 160ms ease-in while the portrait flies back in 200ms ease-in. Focus returns to the card once it is visible again.
- Stills are the real studio photographs, cropped to the picture, with the title under them. Not a window frame and not a "Work" heading.
- Rejected: Sheet (hover only, no bio). The first Stage and Portrait passes (left-aligned bio, no work). Pinned (the name stayed stuck and the long bio ate the first screen). Strip (a sideways row showed less of each still).
