#!/usr/bin/env python3
"""Fail-closed materialization of the production asset archives."""

from __future__ import annotations

import json
import shutil
import stat
import struct
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "production-asset-manifest.json"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def png_metadata(data: bytes, label: str) -> tuple[int, int, bool]:
    if len(data) < 33 or data[:8] != PNG_SIGNATURE or data[12:16] != b"IHDR":
        raise RuntimeError(f"Not a valid PNG: {label}")
    width, height = struct.unpack(">II", data[16:24])
    bit_depth, colour_type = data[24], data[25]
    if width == 0 or height == 0 or bit_depth not in (1, 2, 4, 8, 16) or colour_type not in (0, 2, 3, 4, 6):
        raise RuntimeError(f"Invalid PNG IHDR: {label}")
    # RGBA/greyscale-alpha have intrinsic alpha. Indexed PNGs may use tRNS.
    has_alpha = colour_type in (4, 6) or (colour_type == 3 and b"tRNS" in data)
    return width, height, has_alpha


def member_path(name: str) -> PurePosixPath | None:
    path = PurePosixPath(name)
    if path.is_absolute() or not path.parts or ".." in path.parts or "\\" in name:
        raise RuntimeError(f"Unsafe archive member: {name}")
    if path.parts[0] != "assets":
        return None
    if path.suffix.lower() == ".png":
        return path
    if path.name == ".gitkeep" or not path.suffix:
        return None
    raise RuntimeError(f"Unsupported file in production asset tree: {name}")


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    packages = manifest.get("sourcePackages")
    assets = manifest.get("assets")
    if not isinstance(packages, list) or not packages or not isinstance(assets, list) or not assets:
        raise RuntimeError("Manifest must declare non-empty sourcePackages and assets arrays")

    expected: dict[str, dict] = {}
    by_archive: dict[str, set[str]] = {name: set() for name in packages}
    for entry in assets:
        path, source = entry.get("path"), entry.get("sourceZip")
        if not isinstance(path, str) or path in expected or source not in by_archive:
            raise RuntimeError(f"Invalid or duplicate manifest asset: {path!r}")
        if member_path(path) != PurePosixPath(path) or entry.get("originalFilename") != path:
            raise RuntimeError(f"Manifest path is not a canonical archive path: {path}")
        expected[path] = entry
        by_archive[source].add(path)

    payloads: dict[str, bytes] = {}
    for package in packages:
        archive_path = ROOT / "assets" / package
        if not archive_path.is_file() or archive_path.parent != ROOT / "assets":
            raise RuntimeError(f"Missing or invalid production archive: assets/{package}")
        found: set[str] = set()
        with zipfile.ZipFile(archive_path) as archive:
            for info in archive.infolist():
                mode = info.external_attr >> 16
                if info.flag_bits & 1 or stat.S_ISLNK(mode):
                    raise RuntimeError(f"Encrypted or linked archive member rejected: {info.filename}")
                path = member_path(info.filename)
                if path is None or info.is_dir():
                    continue
                name = path.as_posix()
                if name in found or name in payloads:
                    raise RuntimeError(f"Duplicate production asset in archives: {name}")
                data = archive.read(info)
                png_metadata(data, f"{package}:{name}")
                found.add(name)
                payloads[name] = data
        missing, unexpected = by_archive[package] - found, found - by_archive[package]
        if missing or unexpected:
            raise RuntimeError(f"Archive/manifest mismatch for {package}; missing={sorted(missing)}, unexpected={sorted(unexpected)}")

    if set(payloads) != set(expected):
        raise RuntimeError("Production archives do not exactly match the manifest")
    for path, entry in expected.items():
        actual = (*png_metadata(payloads[path], path), "PNG")
        declared = (entry.get("width"), entry.get("height"), entry.get("hasAlphaChannel"), entry.get("format"))
        if actual != declared:
            raise RuntimeError(f"Metadata mismatch for {path}: {actual} != {declared}")

    with tempfile.TemporaryDirectory(prefix="veilbound-assets-", dir=ROOT) as temp:
        staging = Path(temp)
        for path, data in payloads.items():
            destination = staging / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
        runtime_roots = {PurePosixPath(path).parts[1] for path in expected}
        for directory in runtime_roots:
            target = ROOT / "assets" / directory
            shutil.rmtree(target, ignore_errors=True)
            shutil.move(staging / "assets" / directory, target)

    print(f"PASS — materialized and verified {len(payloads)} production assets from {len(packages)} archives")


if __name__ == "__main__":
    main()
