import json
from pathlib import Path
d=json.loads((Path(__file__).parents[1]/'data/material-market-circulation-v7.7.json').read_text());s=d['summary']
assert s['valid_runs']==12 and s['hard_failures']==0
for k in ('transported','processed','sales','artifacts','consumed','inheritances','multi_history_objects'): assert s[k]>0
print('PASS — persistent material circulation')
