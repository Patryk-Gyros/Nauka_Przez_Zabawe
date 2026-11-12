const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { once } = require('node:events');

const root = path.resolve(__dirname, '..');
const boundary = 'rafcio-upload-test';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
let isolated, enabled, disabled;
const calls = [];
const originalCwd = process.cwd();
const originalKey = process.env.OPENAI_API_KEY;

function multipart(parts) {
  const chunks = [];
  for (const { name = 'images', filename, data = png } of parts) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"${filename === undefined ? '' : `; filename="${filename}"`}\r\n${filename === undefined ? '' : 'Content-Type: image/png\r\n'}\r\n`));
    chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

function request(server, body, contentType = `multipart/form-data; boundary=${boundary}`, chunked = false) {
  return new Promise((resolve, reject) => {
    const headers = body === undefined ? {} : { 'Content-Type': contentType };
    if (body !== undefined && !chunked) headers['Content-Length'] = body.length;
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port,
      path: body === undefined ? '/' : '/analizuj', method: body === undefined ? 'GET' : 'POST', headers }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString(), headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('HTTP test timed out')));
    // Writing before end exercises requests without Content-Length.
    if (body !== undefined) req.write(body);
    req.end();
  });
}

describe('F01 upload', () => {
before(async () => {
  isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'rafcio-upload-'));
  fs.copyFileSync(path.join(root, 'server.js'), path.join(isolated, 'server.js'));
  fs.cpSync(path.join(root, 'utils'), path.join(isolated, 'utils'), { recursive: true });
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(isolated, 'node_modules'), 'dir');
  // No .env, user data or archives are copied. dotenv resolves from this empty cwd.
  process.chdir(isolated);
  const openaiPath = require.resolve('openai');
  require.cache[openaiPath] = { id: openaiPath, filename: openaiPath, loaded: true,
    exports: { default: class {
      constructor() {
        this.chat = { completions: { create: async payload => {
          calls.push(payload);
          return { choices: [{ message: { content: '[]' } }] };
        } } };
      }
    } } };
  const serverPath = path.join(isolated, 'server.js');
  delete process.env.OPENAI_API_KEY;
  disabled = require(serverPath).listen(0, '127.0.0.1');
  await once(disabled, 'listening');
  delete require.cache[require.resolve(serverPath)];
  process.env.OPENAI_API_KEY = 'test-only-no-network';
  enabled = require(serverPath).listen(0, '127.0.0.1');
  await once(enabled, 'listening');
});

after(async () => {
  for (const server of [enabled, disabled]) {
    if (server) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
  }
  process.chdir(originalCwd);
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
  if (isolated) {
    const files = fs.readdirSync(isolated).sort();
    fs.rmSync(isolated, { recursive: true, force: true });
    assert.deepEqual(files, ['node_modules', 'server.js', 'utils'], 'No data or upload files written');
  }
});

async function rejected(body, status, contentType, chunked) {
  const count = calls.length;
  const result = await request(enabled, body, contentType, chunked);
  assert.equal(result.status, status, result.text);
  assert.match(result.headers['content-type'], /application\/json/);
  assert.equal(typeof JSON.parse(result.text).error, 'string');
  assert.equal(calls.length, count, 'Rejected upload must not call AI');
  assert.equal((await request(enabled)).status, 302, 'Shared server remains alive');
}

test('disabled generator rejects malformed multipart before parsing', async () => {
  const result = await request(disabled, Buffer.from('invalid multipart'), 'multipart/form-data');
  assert.equal(result.status, 503);
  assert.match(JSON.parse(result.text).error, /OPENAI_API_KEY/);
  assert.equal(calls.length, 0);
});

test('valid image still reaches the generator unchanged', async () => {
  const count = calls.length;
  const result = await request(enabled, multipart([{ filename: 'one.png' }]));
  assert.equal(result.status, 200, result.text);
  assert.equal(calls.length, count + 1);
  assert.equal(calls.at(-1).messages[0].content[1].image_url.url, `data:image/png;base64,${png.toString('base64')}`);
});

test('accepts five images and a file exactly 5 MiB', async () => {
  const parts = Array.from({ length: 5 }, (_, i) => ({ filename: `${i}.png`, data: i === 0 ? Buffer.alloc(5 * 1024 * 1024) : png }));
  const result = await request(enabled, multipart(parts));
  assert.equal(result.status, 200, result.text);
  assert.equal(calls.at(-1).messages[0].content.length, 6);
});

test('rejects a file above 5 MiB even without Content-Length', async () => {
  await rejected(multipart([{ filename: 'large.png', data: Buffer.alloc(5 * 1024 * 1024 + 1) }]), 413, undefined, true);
});

test('rejects a sixth image', async () => {
  await rejected(multipart(Array.from({ length: 6 }, (_, i) => ({ filename: `${i}.png` }))), 413);
});

test('rejects extra text fields, including crafted array field names', async () => {
  await rejected(multipart([{ name: 'x[]', data: 'a' }, { name: 'x[length]', data: 'not-a-number' }]), 400);
});

test('rejects unexpected file fields', async () => {
  await rejected(multipart([{ name: 'other', filename: 'one.png' }]), 400);
});

test('rejects malformed multipart and missing boundary', async () => {
  await rejected(Buffer.from('broken'), 400, 'multipart/form-data');
  await rejected(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="images"; filename="x.png"\r\n\r\ntruncated`), 400);
});

test('rejects empty uploads and requests without multipart files', async () => {
  await rejected(multipart([]), 400);
  await rejected(Buffer.from('{}'), 400, 'application/json');
});

test('survives an interrupted upload and accepts the next request', async () => {
  await new Promise(resolve => {
    const req = http.request({ hostname: '127.0.0.1', port: enabled.address().port, path: '/analizuj', method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` } });
    req.on('error', () => {});
    req.on('close', resolve);
    req.write(`--${boundary}\r\nContent-Disposition: form-data; name="images"; filename="x.png"\r\n\r\npartial`);
    setTimeout(() => req.destroy(), 20);
  });
  assert.equal((await request(enabled, multipart([{ filename: 'after-abort.png' }]))).status, 200);
});

for (const page of ['public/index.html', 'public/kolo-fortuny/index.html']) {
  test(`${page}: rejected upload displays error without redirect`, async () => {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const elements = Object.fromEntries(['files', 'generateBtn', 'progressContainer', 'progressBar', 'statusText'].map(id => [id, { style: {}, files: [png] }]));
    const context = vm.createContext({ document: { getElementById: id => elements[id] },
      FormData: class { append() {} }, setInterval: () => 1, clearInterval() {},
      setTimeout: () => assert.fail('Must not schedule redirect after rejection'),
      fetch: async () => ({ ok: false, json: async () => ({ error: 'Limit uploadu' }) }) });
    vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
    await context.startAnalysis();
    assert.equal(elements.statusText.innerText, 'Limit uploadu');
    assert.equal(elements.generateBtn.disabled, false);
    assert.equal(elements.progressBar.style.width, '0%');
  });
}

});
