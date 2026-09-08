#!/usr/bin/env python3
from pathlib import Path
import tarfile

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "references" / ".packed" / "reference-pack-proxies.tar.gz"
OUT = ROOT / "references" / "proxies"
OUT.mkdir(parents=True, exist_ok=True)
with tarfile.open(PACK, "r:gz") as tf:
    tf.extractall(OUT)
print("PASS — materialized 12 Veilbound visual reference proxies into references/proxies")
