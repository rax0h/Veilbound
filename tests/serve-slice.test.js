import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

test('preview serves query-string entrypoints and survives directory/missing requests',async()=>{
  const port=43000+Math.floor(Math.random()*15000);
  const server=spawn(process.execPath,['tools/serve-slice.mjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
  try{
    await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`server exited ${code}`)));});
    const base=`http://localhost:${port}`;
    assert.equal((await fetch(`${base}/?review=1`)).status,200);
    assert.equal((await fetch(`${base}/src/`)).status,404);
    assert.equal((await fetch(`${base}/missing.js`)).status,404);
    const page=await fetch(`${base}/`);assert.equal(page.status,200);assert.match(await page.text(),/gameCanvas/);
  }finally{server.kill();}
});
