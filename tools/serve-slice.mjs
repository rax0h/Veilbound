import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, relative, sep } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

createServer(async (request, response) => {
  try {
    const requested = request.url === '/' ? '/index.html' : decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = normalize(join(root, requested));
    const fromRoot = relative(root, path);
    if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || fromRoot.includes(`.${sep}..${sep}`)) throw new Error('Outside repository boundary.');
    await stat(path);
    response.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(port, () => console.log(`Veilbound Riverford Verge: http://localhost:${port}`));
