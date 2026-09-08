import json
from pathlib import Path
d=json.loads((Path(__file__).parents[1]/'data/enterprise-dynasty-v8.4.json').read_text())
s=d['summary']
assert s['runs_with_new_business_dynasty']==8
assert s['runs_with_old_house_survival']==8
assert s['runs_with_wealthy_collapse']>=6
assert max(s['business_created_dynasties'])>0
assert s['max_wealth_observed']<100000
assert s['longest_business_observed']>=900
print('PASS — enterprise can create dynasties; old houses can persist; wealth can still collapse')
