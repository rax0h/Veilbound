# Migration Status

## Runnable now
- Final closed-loop v8.4 simulator source
- Eight-world / 1,000-year rerun harness: `python simulation/run_closed_suite.py`
- All preserved simulator source modules from v7.6 through v8.4
- All preserved verifier scripts from v7.6 through v8.4
- Closed-state/closure documentation, changelog, Harker chronicle, and v8.2 contract audit
- Locked v8.5 visual constitution, reference catalog, proof scene contract, visual verifier, schema, and v8.5 state
- Clean production source foundation, tests, rendering/asset contracts, save/input/world/combat/character systems
- Canonical 62-Essence semantic dictionary packed losslessly in `canon/.packed/semantic-dictionary-v0.1.json.gz.b64`; `npm test`, `npm run verify`, or `python tools/materialize-canon.py` materializes and SHA-verifies the exact JSON

## Commands
- Run final closed loop: `python simulation/run_closed_suite.py`
- Run production tests: `npm test`
- Run production boundary verification: `npm run verify`

The final v8.4 closed-loop suite was reproduced from the preserved source and matched the locked eight-world / 1,000-year acceptance summary.

## Preserved source artifacts still not physically in GitHub
These are not required to run the final closed-loop simulation:
- six large historical result snapshots: v7.9, v8.0, both v8.1 snapshots, v8.3, and v8.4
- 13 v8.5 binary visual reference images
- GS001–GS003 PNG production assets

Canonical byte sizes and SHA-256 identities for the historical result snapshots are recorded in `simulation/data/PRESERVED_OUTPUT_HASHES.json`.
The v7.6–v7.8 result JSONs were not present in the preserved closed-source package itself; their simulator source and verifier scripts are preserved.
