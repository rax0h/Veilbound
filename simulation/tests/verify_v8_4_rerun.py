#!/usr/bin/env python3
from pathlib import Path
import subprocess
import sys

root = Path(__file__).parents[1]
result = subprocess.run(
    [sys.executable, str(root / "run_closed_suite.py"), "--no-write"],
    cwd=root.parent,
    text=True,
    capture_output=True,
)
print(result.stdout, end="")
if result.stderr:
    print(result.stderr, file=sys.stderr, end="")
raise SystemExit(result.returncode)
