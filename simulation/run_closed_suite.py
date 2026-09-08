#!/usr/bin/env python3
"""Re-run the closed v8.4 enterprise -> wealth -> dynasty acceptance suite.

This is an executable harness around the preserved canonical v8.4 simulator.
The historical simulator source intentionally contains only the simulation function,
so this runner injects the standard-library modules it used when the closure run was made.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SIM_PATH = ROOT / "simulator" / "enterprise_dynasty_v8_4.py"
DEFAULT_OUTPUT = ROOT / "data" / "enterprise-dynasty-v8.4-rerun.json"
SEEDS = [843000 + i for i in range(8)]

LOCKED_SUMMARY = {
    "runs": 8,
    "new_money_dynasties": [3, 3, 6, 9, 1, 5, 4, 2],
    "old_house_dynasties": [3, 4, 9, 6, 3, 5, 8, 1],
    "business_created_dynasties": [3, 3, 6, 9, 1, 5, 4, 2],
    "collapsed_once_wealthy": [2, 3, 1, 1, 2, 1, 1, 0],
    "runs_with_new_business_dynasty": 8,
    "runs_with_old_house_survival": 8,
    "runs_with_wealthy_collapse": 7,
    "max_rank_observed": 3,
    "max_wealth_observed": 45909.2,
    "longest_business_observed": 1000,
}


def load_simulator():
    spec = importlib.util.spec_from_file_location("veilbound_enterprise_v8_4", SIM_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {SIM_PATH}")
    module = importlib.util.module_from_spec(spec)
    # These are the exact standard-library globals referenced by the preserved source.
    module.random = random
    module.math = math
    spec.loader.exec_module(module)
    return module


def summarize(runs):
    summaries = [r["summary"] for r in runs]
    return {
        "runs": len(runs),
        "new_money_dynasties": [s["new_money_dynasties"] for s in summaries],
        "old_house_dynasties": [s["old_house_dynasties"] for s in summaries],
        "business_created_dynasties": [s["business_created_dynasties"] for s in summaries],
        "collapsed_once_wealthy": [s["collapsed_once_wealthy"] for s in summaries],
        "runs_with_new_business_dynasty": sum(s["business_created_dynasties"] > 0 for s in summaries),
        "runs_with_old_house_survival": sum(s["old_house_dynasties"] > 0 for s in summaries),
        "runs_with_wealthy_collapse": sum(s["collapsed_once_wealthy"] > 0 for s in summaries),
        "max_rank_observed": max(s["highest_rank"] for s in summaries),
        "max_wealth_observed": round(max(s["highest_wealth"] for s in summaries), 1),
        "longest_business_observed": max(s["longest_business"] for s in summaries),
    }


def compact_run(run):
    return {
        "seed": run["seed"],
        "summary": run["summary"],
        "yearly": run["yearly"],
    }


def main():
    parser = argparse.ArgumentParser(description="Run Veilbound closed v8.4 simulation suite")
    parser.add_argument("--years", type=int, default=1000)
    parser.add_argument("--families", type=int, default=180)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--no-write", action="store_true")
    args = parser.parse_args()

    sim = load_simulator()
    runs = [sim.simulate(seed=s, years=args.years, n_families=args.families) for s in SEEDS]
    summary = summarize(runs)
    payload = {
        "revision": "8.4-enterprise-wealth-dynasty-CLOSED-rerun",
        "seeds": SEEDS,
        "years": args.years,
        "families": args.families,
        "summary": summary,
        "runs": [compact_run(r) for r in runs],
    }

    if not args.no_write:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print(json.dumps(summary, indent=2))
    if args.years == 1000 and args.families == 180:
        if summary != LOCKED_SUMMARY:
            raise SystemExit("FAIL — rerun does not match locked v8.4 acceptance summary")
        print("PASS — rerun exactly matches locked v8.4 acceptance summary")
    else:
        print("PASS — custom simulation completed (locked-summary comparison skipped)")


if __name__ == "__main__":
    main()
