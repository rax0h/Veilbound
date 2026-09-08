# Riverford Verge acceptance record

Date: 2026-09-08. Starting main: 114e7d1fb889e4e33ee24192ebc16c74b2234dbb.

## Baseline findings

All original verification passed, but the deployed slice reproduced a first-frame exception (`deltaSeconds must be non-negative`) and a black world. After repairing the timing bound, desktop and portrait inspection showed upright path/water panels, sparse scene composition, mismatched object scale and a bridge outside the reachable region.

## Changes verified locally

- Continuous perspective terrain, the road/river/crossing layout, foreground framing and distant forest depth.
- Exploration player height within the locked 10–14% range on desktop and portrait/landscape phone-sized viewports.
- Keyboard movement and interaction, pointer walking, farmer dialogue and save/restore.
- Mobile stick movement and release, farmer interaction and responsive dialogue; portrait touch Aegis/strikes through victory, followed by reload with the defeated wolf preserved. Landscape controls visually inspected at 844×390.
- Bridge traversal and physical collision. Raised deck picking and deck/actor draw-order repairs.
- Combat initiation, wind-up, damage, keyboard strike/Aegis and defeat recovery.
- All 46 production PNGs materialize. All 21 tests and repository checks pass; new regression coverage addresses first-frame timing, save corruption/migration, reachable routes, camera scale, the crossing, raised-deck picking and server query/directory handling.
- Closed simulation rerun exactly matches the locked v8.4 acceptance summary.

The browser review harness offers 1280×800 desktop, 390×844 portrait and 844×390 landscape frames, with local or deployed Pages sources. Diagnostics report observed render timing only; they are not a physical-device performance guarantee.

## Unresolved full-art gate

**Full visual acceptance remains blocked by source-art defects.** Interior transparent holes in several character/creature PNGs make parts of bodies see-through. This is present before rendering. No alpha reconstruction, black-keying, screen blending, stand-in art or reference-board runtime use has been introduced.

The targeted art correction is to supply intact authored RGBA versions of the affected existing character/creature assets, preserving identity, pose, style and filenames. Restore a decodable Reference Zero proxy/reference pack for exact visual comparison. This is a bounded source repair, not a restart of asset production.

Production code and deployment can be verified independently of this blocked art gate. Do not label the slice fully demo-ready merely because CI is green. The final deployment result and exact commit must be checked directly in GitHub Actions and the live Pages build.json, then the deployed scene must be inspected again.
