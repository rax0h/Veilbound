import json
from pathlib import Path
d=json.loads((Path(__file__).parents[1]/'data/harker-line-v8.3.json').read_text())
assert d['summary']['living_descendants']>0
assert d['summary']['living_Harker_surname']==0
assert d['summary']['max_generation']>20
assert d['stats']['surges']>0
print('PASS — Harker genealogy chronicle')
