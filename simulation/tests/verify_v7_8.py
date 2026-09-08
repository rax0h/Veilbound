import json
from pathlib import Path
s=json.loads((Path(__file__).parents[1]/'data/emergent-craft-traditions-v7.8.json').read_text())['summary']
assert s['valid_runs']==12 and s['hard_failures']==0
assert s['apprenticeships'] and s['transmissions'] and s['variations']
assert s['emergent_schools']>0 and s['lost_techniques']>0
assert s['books']>0 and s['book_learning']>0
print('PASS — emergent craft traditions')
