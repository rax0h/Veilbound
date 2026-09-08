import json
from pathlib import Path
s=json.loads((Path(__file__).parents[1]/'data/integrated-household-demography-v8.1-CLOSED.json').read_text())['summary']
assert s['reached_1000']==8 and s['valid_runs']==8 and s['hard_failures']==0
assert min(s['final_populations'])>0
assert all(1.9 < x < 2.3 for x in s['completed_children_per_woman'])
print('PASS — v8.1 explicit household demography closed')
