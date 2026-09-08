#!/usr/bin/env python3
from pathlib import Path
import tarfile
ROOT=Path(__file__).resolve().parents[1]
for name in ('simulation_text.tar.gz','production_text.tar.gz'):
    src=ROOT/'archive'/name
    if not src.exists():
        raise SystemExit(f'missing {src}')
    with tarfile.open(src,'r:gz') as t:
        t.extractall(ROOT)
print('PASS — preserved Veilbound text sources hydrated into repository working tree')
