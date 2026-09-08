# Veilbound Visual References

The locked v8.5 visual reference set contains 13 source images.

For immediate Codex visual access, this repository includes a compact visual proxy set derived from those locked references without changing the controlling visual constitution:

- `references/proxies/reference-zero.jpg` — Reference Zero proxy, materialized directly in GitHub.
- `references/.packed/reference-pack-proxies.tar.gz` — the other 12 visual proxies.
- `python tools/materialize-references.py` — extracts the remaining proxies into `references/proxies/`.

The proxies are for visual inspection and implementation guidance. The original v8.5 source-image identities remain defined by `canon/reference-catalog.json` and `canon/SOURCE_HASHES.sha256`; proxy files do not replace or redefine those locked source hashes.
