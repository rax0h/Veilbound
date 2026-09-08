from pathlib import Path
import json, hashlib, sys
ROOT=Path(__file__).resolve().parents[1]
errors=[]
def load(p): return json.loads((ROOT/p).read_text())
constitution=load('visual/visual-constitution-v1.json')
catalog=load('visual/reference-catalog.json')
proof=load('visual/proof/gold-standard-scene-v1.json')
if constitution.get('status')!='LOCKED': errors.append('constitution not LOCKED')
if len(constitution.get('forbidden',[]))<8: errors.append('forbidden drift list too weak')
cam=constitution['non_negotiables']['camera']
if cam['mode']!='elevated_forward_three_quarter': errors.append('camera mode drift')
if not (cam['player_screen_height_min']==0.10 and cam['player_screen_height_max']==0.14): errors.append('player scale contract drift')
# reference files are immutable by hash
known=set()
for r in catalog['references']:
    p=ROOT/r['file']; known.add(r['file'])
    if not p.exists(): errors.append(f'missing reference {r["file"]}'); continue
    h=hashlib.sha256(p.read_bytes()).hexdigest()
    if h!=r['sha256']: errors.append(f'reference hash changed {r["file"]}')
    if r['width']<1000 or r['height']<600: errors.append(f'reference resolution unexpectedly low {r["file"]}')
# proof manifest contract
if proof.get('placeholder') is not False: errors.append('gold scene marked placeholder')
if proof.get('status')!='production_pipeline_proof': errors.append('gold scene wrong status')
for ref in proof.get('reference_lineage',[]):
    if ref not in known: errors.append(f'proof lineage not locked: {ref}')
pc=proof.get('camera',{})
if pc.get('mode')!='elevated_forward_three_quarter': errors.append('proof camera drift')
if not (0.10 <= float(pc.get('player_screen_height',0)) <= 0.14): errors.append('proof player scale outside 10-14%')
if pc.get('world_dominant') is not True: errors.append('world not dominant')
if int(pc.get('depth_planes_min',0))<3: errors.append('insufficient depth planes')
# explicit character separation is non-negotiable
classes=set(constitution['non_negotiables']['characters']['asset_separation'])
if classes!={'exploration_body','battle_body','ui_dialogue_portrait'}: errors.append('character presentation classes drift')
if errors:
    print('FAIL — VISUAL GATE')
    for e in errors: print(' -',e)
    sys.exit(1)
print(f'PASS — VISUAL GATE: {len(catalog["references"])} locked references; camera, scale, depth, lineage and anti-drift contracts intact')
