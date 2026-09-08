#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib

ROOT = Path(__file__).resolve().parents[1]
packed = ROOT / 'canon' / '.packed' / 'semantic-dictionary-v0.1.json.gz.b64'
out = ROOT / 'canon' / 'semantic-dictionary-v0.1.json'
expected = '045d7251aea730315abebca7270040bc5daa31e6e3f58960dfe7b0afa9754090'
raw = gzip.decompress(base64.b64decode(packed.read_text().strip()))
actual = hashlib.sha256(raw).hexdigest()
if actual != expected:
    raise SystemExit(f'FAIL — semantic dictionary hash mismatch: {actual}')
out.write_bytes(raw)
print(f'PASS — materialized {out.relative_to(ROOT)} ({len(raw)} bytes; sha256 {actual})')
