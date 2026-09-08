import json
from pathlib import Path
d=json.loads((Path(__file__).parents[1]/'data/final-contract-audit-v8.2.json').read_text())
assert d['source_contracts_passed']==d['source_contracts_total']
r=d['relevance_scaling']; assert r['valid_runs']==8 and r['hard_failures']==0
assert d['forbidden_average_detection']['detected']==100
print('PASS — final integrated contracts + relevance scaling')
