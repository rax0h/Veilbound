#!/usr/bin/env python3
"""Apply reviewed, source-hash-bound alpha masks without changing source RGB.

Original archives are preserved. The masks restore damaged opaque interiors in
nine character/creature sprites; atmospheric alpha and all scenery are untouched.
"""
import sys
import base64
import hashlib
import json
import zlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def repair_all(destination=ROOT):
    repairs = json.loads((ROOT / 'assets/alpha-repairs.json').read_text())
    for entry in repairs['assets']:
        path = destination / entry['path']
        if hashlib.sha256(path.read_bytes()).hexdigest() != entry['sourceSha256']:
            raise RuntimeError(f"Alpha repair source changed: {entry['path']}")
        original = Image.open(path).convert('RGBA')
        rgb = original.convert('RGB').tobytes()
        size = (entry['width'], entry['height'])
        if original.size != size:
            raise RuntimeError(f"Alpha repair dimensions changed: {entry['path']}")
        mask = Image.frombytes('1', size, zlib.decompress(base64.b64decode(entry['mask']))).convert('L')
        original.putalpha(mask)
        assert original.convert('RGB').tobytes() == rgb, 'Source colors must never change'
        original.save(path)
    print(f"PASS — restored authored RGB beneath reviewed alpha masks for {len(repairs['assets'])} sprites")

if __name__ == '__main__':
    repair_all(Path(sys.argv[1]) if len(sys.argv)>1 else ROOT)
