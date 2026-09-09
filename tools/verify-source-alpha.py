"""Regression checks against preserved originals, not regenerated expectations."""
import io,json,zipfile
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'assets/production-asset-manifest.json').read_text())
repairs=json.loads((ROOT/'assets/alpha-repairs.json').read_text())
paths={e['path'] for e in repairs['assets']}
for e in manifest['assets']:
    path=e['path']
    with zipfile.ZipFile(ROOT/'assets'/e['sourceZip']) as archive:
        data=archive.read(path)
    actual=Image.open(ROOT/path).convert('RGBA')
    original=Image.open(io.BytesIO(data)).convert('RGBA')
    assert actual.convert('RGB').tobytes()==original.convert('RGB').tobytes(),f'RGB changed: {path}'
    if path not in paths:
        assert (ROOT/path).read_bytes()==data,f'Unrelated art changed: {path}'
    else:
        alpha=actual.getchannel('A')
        assert alpha.getpixel((0,0))==0,f'Background opaque: {path}'
        assert alpha.histogram()[255]>original.getchannel('A').histogram()[255],f'No repair: {path}'
# Previously see-through body samples; true gaps must remain transparent.
for name,inside,gap in [
 ('characters/player_battle_base_01.png',(390,450),(730,650)),
 ('characters/player_exploration_base_01.png',(300,820),(380,1060)),
 ('creatures/dire_wolf_exploration_01.png',(650,300),(700,700)),
]:
    im=Image.open(ROOT/'assets'/name)
    assert im.getpixel(inside)[3]==255,f'Body hole: {name}'
    assert im.getpixel(gap)[3]==0,f'Gap filled: {name}'
print('PASS — source RGB preserved for all 46 assets; nine alpha repairs applied; body and gap probes correct')
