import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const srcRoot = path.join(root, 'src');
const forbiddenTokens = [
  'visual-slice-bg.svg',
  'swiftfang-fox-atlas.svg',
  'physical-world.js',
  'systems-render.js',
  'rax0h/veilbound1',
];

async function files(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = path.join(dir, name);
    if ((await stat(p)).isDirectory()) out.push(...await files(p)); else out.push(p);
  }
  return out;
}

for (const file of await files(srcRoot)) {
  const text = await readFile(file, 'utf8');
  for (const token of forbiddenTokens) {
    if (text.includes(token)) throw new Error(`Production boundary violation in ${path.relative(root, file)}: ${token}`);
  }
  if (/(?:from\s+|import\s*\()\s*['"](?:\.\.\/)*references\//.test(text)) {
    throw new Error(`Runtime source may not import references directly: ${path.relative(root, file)}`);
  }
}
console.log('PASS — clean production boundary intact; rejected prototype/runtime reference imports absent');
