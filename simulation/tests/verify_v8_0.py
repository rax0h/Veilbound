import json
from pathlib import Path
d=json.loads((Path(__file__).parents[1]/'data/full-world-millennium-v8.0.json').read_text());s=d['summary']
assert s['reached_1000']==8 and s['valid_runs']==8 and s['hard_failures']==0
assert s['surges']>0 and s['missions']>0 and s['mission_failures']>0
assert s['persistent_objects']>0 and s['inheritances']>0 and s['artifacts']>0
print('PASS — v8.0 composition millennium; demographic envelope caveat remains')
