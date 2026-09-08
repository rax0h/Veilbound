#!/usr/bin/env python3
"""Build transparent runtime art from the preserved Gold Standard source packs."""

from pathlib import Path, PurePosixPath
import json
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from png_runtime import crop_with_black_alpha, decode_png, encode_rgba  # noqa: E402


def safe_member(name: str) -> None:
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts:
        raise RuntimeError(f"Unsafe source member: {name}")


def main() -> None:
    manifest = json.loads((ROOT / "assets/production-asset-manifest.json").read_text())
    archives = {}
    built = set()
    try:
        for asset in manifest["assets"]:
            source, output = asset["source"], asset["output"]
            safe_member(source["file"])
            archive_path = ROOT / source["zip"]
            archive = archives.setdefault(str(archive_path), zipfile.ZipFile(archive_path))
            if source["file"] not in archive.namelist():
                raise RuntimeError(f"Missing source for {asset['id']}: {source['file']}")
            width, height, rows = decode_png(archive.read(source["file"]))
            if [width, height] != [source["width"], source["height"]]:
                raise RuntimeError(f"Source dimensions changed for {asset['id']}")
            x0, y0, x1, y1 = source["crop"]
            if not (0 <= x0 < x1 <= width and 0 <= y0 < y1 <= height):
                raise RuntimeError(f"Crop is outside source bounds for {asset['id']}")
            alpha = output["alpha"]
            if alpha["mode"] != "black_threshold":
                raise RuntimeError(f"Unsupported alpha rule for {asset['id']}")
            out_width, out_height, pixels = crop_with_black_alpha(
                rows, source["crop"], alpha["threshold"], alpha["feather"]
            )
            if [out_width, out_height] != [output["width"], output["height"]]:
                raise RuntimeError(f"Generated dimensions disagree for {asset['id']}")
            if alpha["required"] and not any(row[x] < 255 for row in pixels for x in range(3, len(row), 4)):
                raise RuntimeError(f"Required transparency was not generated for {asset['id']}")
            destination = ROOT / output["path"]
            if not destination.resolve().is_relative_to((ROOT / ".runtime").resolve()):
                raise RuntimeError(f"Runtime output escapes ignored directory for {asset['id']}")
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(encode_rgba(out_width, out_height, pixels))
            built.add(output["path"])
    finally:
        for archive in archives.values():
            archive.close()
    if built != {asset["output"]["path"] for asset in manifest["assets"]}:
        raise RuntimeError("Not every declared runtime asset was generated")
    print(f"PASS — generated {len(built)} cropped transparent Gold Standard runtime assets")


if __name__ == "__main__":
    main()
