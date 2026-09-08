#!/usr/bin/env python3
"""Safely materialize runtime PNGs from the preserved Gold Standard packs."""

from pathlib import Path, PurePosixPath
import json
import struct
import zipfile

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "production-asset-manifest.json"


def png_metadata(path: Path) -> tuple[int, int, bool]:
    header = path.read_bytes()[:26]
    if header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise RuntimeError(f"Not a valid PNG: {path.relative_to(ROOT)}")
    width, height = struct.unpack(">II", header[16:24])
    return width, height, header[25] in (4, 6)


def safe_asset_path(name: str) -> Path | None:
    relative = PurePosixPath(name)
    if relative.is_absolute() or ".." in relative.parts:
        raise RuntimeError(f"Unsafe archive member: {name}")
    if len(relative.parts) < 3 or relative.parts[0] != "assets":
        return None
    if relative.suffix.lower() != ".png" and relative.name != ".gitkeep":
        return None
    return ROOT.joinpath(*relative.parts)


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected = {entry["path"]: entry for entry in manifest["assets"]}
    extracted: set[str] = set()

    for package in manifest["sourcePackages"]:
        archive_path = ROOT / "assets" / package
        with zipfile.ZipFile(archive_path) as archive:
            for info in archive.infolist():
                destination = safe_asset_path(info.filename)
                if destination is None or info.is_dir():
                    continue
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(archive.read(info))
                if info.filename.endswith(".png"):
                    extracted.add(info.filename)

    missing = set(expected) - extracted
    unexpected = extracted - set(expected)
    if missing or unexpected:
        raise RuntimeError(f"Asset/manifest mismatch; missing={sorted(missing)}, unexpected={sorted(unexpected)}")

    for relative, entry in expected.items():
        width, height, alpha = png_metadata(ROOT / relative)
        actual = (width, height, alpha)
        declared = (entry["width"], entry["height"], entry["hasAlphaChannel"])
        if actual != declared:
            raise RuntimeError(f"Metadata mismatch for {relative}: {actual} != {declared}")

    print(f"PASS — materialized and verified {len(extracted)} Gold Standard runtime assets")


if __name__ == "__main__":
    main()
