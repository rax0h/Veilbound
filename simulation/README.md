# Veilbound simulation

The final closed simulation bridge is v8.4: enterprise -> wealth -> dynasty emergence/dissolution.

Run the exact locked acceptance suite from the repository root:

```bash
python simulation/run_closed_suite.py
```

That executes eight deterministic 1,000-year worlds using seeds 843000-843007 and compares the fresh result against the locked v8.4 acceptance summary. A successful default run ends with:

`PASS — rerun exactly matches locked v8.4 acceptance summary`

To run a custom duration/family count:

```bash
python simulation/run_closed_suite.py --years 250 --families 180
```

To run the executable verifier:

```bash
python simulation/tests/verify_v8_4_rerun.py
```

Canonical preserved files currently used by this runner:
- `simulator/enterprise_dynasty_v8_4.py`
- `state/CURRENT_STATE.json`
- `docs/V8.4_CLOSURE.md`

Historical simulation stages are preserved as migration material; the v8.4 runner is the executable closed-loop acceptance suite and does not depend on a pre-generated result JSON.
