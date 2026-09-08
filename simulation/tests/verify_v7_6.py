import json
from pathlib import Path
d=json.loads((Path(__file__).parents[1]/'data/persistent-expedition-economy-v7.6.json').read_text());s=d['summary']
assert s['valid_runs']==16 and s['hard_failures']==0
assert s['failed_outcomes']>0 and s['surge_operations']>0
assert s['objects_by_kind']['monster_core']>0 and s['objects_by_kind']['Essence']>0 and s['objects_by_kind']['Awakening Stone']>0
print('PASS — persistent expedition economy')
