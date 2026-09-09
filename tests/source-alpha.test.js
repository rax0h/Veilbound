import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

test('repaired sprites retain exact source colors, opaque bodies and transparent surroundings',()=>{
  const result=execFileSync('python',['tools/verify-source-alpha.py'],{encoding:'utf8'});
  assert.match(result,/PASS/);
});
