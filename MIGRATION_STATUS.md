# Migration Status

## Runnable now
- Final closed-loop v8.4 simulator source
- Eight-world / 1,000-year rerun harness
- v8.4 closure record and locked state
- Preserved historical simulation source/data/docs/tests packaged in `archive/simulation_text.tar.gz`
- Preserved clean production source/tests/tools packaged in `archive/production_text.tar.gz`
- Hydration tool: `python tools/hydrate_preserved_sources.py`

## Commands
- Run final closed loop: `python simulation/run_closed_suite.py`
- Hydrate all preserved text sources/data/tests into the working tree: `python tools/hydrate_preserved_sources.py`

## Still not physically migrated
- v8.5 binary visual reference images
- GS001–GS003 PNG production assets

Those binary visual assets are not required to run the closed-loop simulation.
