# Repository Boundary — Locked

This is a new repository with a hard boundary against the rejected prototype.

## Forbidden imports

Do not copy directories or renderer code wholesale from `rax0h/veilbound1`.
Do not import SVG placeholder atlases, flat geometric world art, visual-slice backgrounds, or board-as-background assets.
Do not use reference-board images in runtime code.

## Allowed ports

A legacy system may be ported only when:
1. it is implementation logic rather than rejected presentation,
2. it is reviewed against current canon,
3. its dependencies are understood,
4. it is rewritten or isolated cleanly inside the new architecture.

## Visual release gate

Before any build is shown as a visual milestone, capture the actual running game and compare it against Reference Zero for camera, player scale, world depth, material richness, foliage density, architecture, lighting, atmosphere, and UI language.

If the comparison is obviously below the target, the build does not ship as a visual milestone.
