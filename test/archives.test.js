const { describe, test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');
const { hashParentPin } = require('../utils/parentPin');

const root = path.resolve(__dirname, '..');
const originalCwd = process.cwd();
const originalKey = process.env.OPENAI_API_KEY;
const pin = '482963'; // Synthetic test credential, never used with real data.
const pinHash = hashParentPin(pin);
let isolated, server, dataPath, archiveDir, token;

function fixture() {
  return {
    parentPin: pinHash, pinSet: true,
    settings: { childName: 'Testowy profil A', status: 'setup', gameStarted: false,
      startDate: '2026-01-01', endDate: '2026-01-31', firstSetupPending: false,
      questionOfTheDay: 'Test?', questionOfTheDayPoints: 10,
      questionOfTheDayStatus: { '2026-01-02': 'done' }, questionOfTheDayAnswers: {} },
    tasks: [{ id: 't1', name: 'Testowy obowiązek', points: 10 }],
    extras: [{ id: 'e1', name: 'Testowa aktywność', points: 5 }],
    challenges: [{ id: 'c1', name: 'Testowa misja', points: 20, color: '#168fe8' }],
    rewards: [{ id: 'r1', name: 'Testowa nagroda', cost: 15 }],
    records: { '2026-01-02': { tasks: { t1: true }, extras: { e1: true }, challenges: { c1: true } } },
    redemptions: [{ id: 'rr1', rewardId: 'r1', cost: 15, status: 'approved' }],
    consequences: [{ id: 'co1', points: 2, reason: 'Test' }],
    bonusPoints: [{ id: 'b1', points: 3, createdAt: '2026-01-02T12:00:00Z' }]
  };
}

function api(route, body, auth = token) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : JSON.stringify(body);
    const headers = auth ? { Authorization: `Bearer ${auth}` } : {};
    if (data !== null) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port,
      path: `/api/punktacja${route}`, method: data === null ? 'GET' : 'POST', headers }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()) }); }
        catch (err) { reject(err); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('HTTP test timed out')));
    req.end(data);
  });
}

function savedData() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeArchive(name) {
  const data = fixture();
  delete data.parentPin;
  delete data.pinSet;
  const archive = { format: 'system-rafcia-archive', version: 1,
    savedAt: '2026-01-03T12:00:00.000Z', label: 'Archiwum testowe', data };
  fs.mkdirSync(archiveDir, { recursive: true });
  fs.writeFileSync(path.join(archiveDir, name), JSON.stringify(archive));
  return data;
}

describe('F05 archives', () => {
  before(async () => {
    isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'rafcio-archives-'));
    fs.copyFileSync(path.join(root, 'server.js'), path.join(isolated, 'server.js'));
    fs.cpSync(path.join(root, 'utils'), path.join(isolated, 'utils'), { recursive: true });
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(isolated, 'node_modules'), 'dir');
    dataPath = path.join(isolated, 'punktacja-data.json');
    archiveDir = path.join(isolated, 'punktacja-archive');
    // Only code is copied; dotenv and all application writes use the temporary directory.
    process.chdir(isolated);
    delete process.env.OPENAI_API_KEY;
    server = require(path.join(isolated, 'server.js')).listen(0, '127.0.0.1');
    await once(server, 'listening');
  });

  beforeEach(async () => {
    fs.rmSync(archiveDir, { recursive: true, force: true });
    fs.writeFileSync(dataPath, JSON.stringify(fixture()));
    const login = await api('/parent/login', { pin }, null);
    assert.equal(login.status, 200);
    token = login.body.token;
  });

  after(async () => {
    if (server) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    process.chdir(originalCwd);
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
    if (isolated) fs.rmSync(isolated, { recursive: true, force: true });
  });

  test('save → list → restore keeps the game history and current parent PIN', async () => {
    const original = savedData();
    const created = await api('/parent/new-game', { childName: 'Testowy profil B',
      startDate: '2026-02-01', endDate: '2026-02-28', saveCurrent: true });
    assert.equal(created.status, 200);
    const id = created.body.archiveId;
    assert.ok(id);
    assert.equal(savedData().settings.childName, 'Testowy profil B');
    assert.deepEqual(savedData().records, {});
    const archive = JSON.parse(fs.readFileSync(path.join(archiveDir, id), 'utf8'));
    const { parentPin, pinSet, ...originalGame } = original;
    assert.deepEqual(archive.data, originalGame);
    assert.equal(archive.format, 'system-rafcia-archive');
    assert.equal(archive.version, 1);
    assert.deepEqual(fs.readdirSync(archiveDir), [id], 'No temporary file left after save');

    const listed = await api('/parent/archives');
    assert.equal(listed.status, 200);
    assert.deepEqual(listed.body.archives.map(item => item.id), [id]);
    assert.equal(listed.body.archives[0].label, archive.label);

    const changed = await api('/parent/change-pin', { currentPin: pin, newPin: '739482' });
    assert.equal(changed.status, 200);
    token = changed.body.token;
    const currentPinHash = savedData().parentPin;
    assert.notEqual(currentPinHash, parentPin);
    const restored = await api('/parent/archive/load', { id });
    assert.equal(restored.status, 200);
    assert.deepEqual(savedData(), { ...originalGame, parentPin: currentPinHash, pinSet: true });
    assert.deepEqual(restored.body.data, { ...originalGame, pinSet: true });
    const reread = await api('');
    assert.deepEqual(reread.body, restored.body.data);
    assert.equal((await api('/parent/login', { pin: '739482' }, null)).status, 200);
  });

  for (const id of ['rafcia-20260103120000-abc123.json', 'rafcia-20260103-120000-abc123.json']) {
    test(`lists and restores existing archive without renaming: ${id}`, async () => {
      const expected = writeArchive(id);
      const changed = savedData();
      changed.records = {};
      fs.writeFileSync(dataPath, JSON.stringify(changed));
      const listed = await api('/parent/archives');
      assert.equal(listed.status, 200);
      assert.deepEqual(listed.body.archives.map(item => item.id), [id]);
      assert.equal((await api('/parent/archive/load', { id })).status, 200);
      assert.deepEqual(savedData(), { ...expected, parentPin: pinHash, pinSet: true });
      assert.deepEqual(fs.readdirSync(archiveDir), [id]);
    });
  }

  test('ignores unrelated files and rejects traversal or missing archives without changing data', async () => {
    for (const name of ['rafcia-20260103120000-abc123.json.tmp', 'notes.json', 'rafcia-20260103-abc123.json']) writeArchive(name);
    const before = fs.readFileSync(dataPath, 'utf8');
    const listed = await api('/parent/archives');
    assert.equal(listed.status, 200);
    assert.deepEqual(listed.body.archives, []);
    for (const id of ['../punktacja-data.json', '/tmp/rafcia-20260103120000-abc123.json',
      'rafcia-20260103120000-abc123.json.tmp', 'rafcia-20260103-abc123.json', '']) {
      assert.equal((await api('/parent/archive/load', { id })).status, 400, id);
    }
    assert.equal((await api('/parent/archive/load', { id: 'rafcia-20260103120000-ffffff.json' })).status, 404);
    assert.equal(fs.readFileSync(dataPath, 'utf8'), before);
  });

  test('listing and restoring still require a parent session', async () => {
    const id = 'rafcia-20260103120000-abc123.json';
    writeArchive(id);
    const before = fs.readFileSync(dataPath, 'utf8');
    assert.equal((await api('/parent/archives', undefined, null)).status, 401);
    assert.equal((await api('/parent/archive/load', { id }, null)).status, 401);
    assert.equal(fs.readFileSync(dataPath, 'utf8'), before);
  });
});
