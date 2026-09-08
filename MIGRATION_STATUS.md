# Migration Status

## Runnable in repository now
- `simulation/simulator/enterprise_dynasty_v8_4.py` — preserved v8.4 closed-loop source
- `simulation/run_closed_suite.py` — executable eight-world, 1,000-year acceptance runner
- `simulation/tests/verify_v8_4_rerun.py` — rerun verifier
- `simulation/state/CURRENT_STATE.json` — locked v8.4 state
- `simulation/docs/V8.4_CLOSURE.md` — closure record
- `simulation/simulator/relevance_scaling_audit_v8_2.py`
- production foundation under `src/`
- Codex handoff and Gold Standard asset manifest

The default v8.4 runner has been locally reproduced from the preserved source and exactly matches the locked acceptance summary for seeds 843000–843007.

## Still to migrate from preserved source packages
- remaining historical v7.6–v8.3 simulator source, tests, docs, history, and stored result JSONs
- canonical semantic dictionary JSON
- v8.5 visual reference binaries and anti-drift files
- GS001–GS003 PNG assets

Do not treat the complete project migration as finished until these remaining preserved artifacts are present. The final v8.4 closed-loop simulation itself is runnable now with:

`python simulation/run_closed_suite.py`
