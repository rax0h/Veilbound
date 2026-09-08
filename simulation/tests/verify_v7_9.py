import json
from pathlib import Path
s=json.loads((Path(__file__).parents[1]/'data/culture-memory-feedback-v7.9.json').read_text())['summary']
assert s['valid_runs']==16 and s['hard_failures']==0
assert s['events'] and s['norms'] and s['institutions']
assert s['forgotten_memories']>0 and s['cultural_transfers']>0
print('PASS — causal culture memory feedback')
