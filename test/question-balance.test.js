const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { fork } = require('node:child_process');
const { once } = require('node:events');
const { hashParentPin } = require('../utils/parentPin');

const root = path.resolve(__dirname, '..');
const pin = '482963'; // Synthetic credential used only in the temporary directory.
const pinHash = hashParentPin(pin);
let isolated, dataPath, child, port, token, screen;

function fixture() {
  return {
    parentPin: pinHash, pinSet: true,
    settings: { childName: 'Test', status: 'setup', gameStarted: false,
      startDate: '', endDate: '', firstSetupPending: false,
      questionOfTheDayPoints: 10, questionOfTheDayStatus: { '2026-01-02': 'done' },
      questionOfTheDayAnswers: {} },
    tasks: [], extras: [], challenges: [], records: {},
    rewards: [{ id: 'r10', name: 'Test 10', cost: 10 }, { id: 'r11', name: 'Test 11', cost: 11 }],
    redemptions: [], bonusPoints: [], consequences: []
  };
}
function write(data) { fs.writeFileSync(dataPath, JSON.stringify(data)); }
function saved() { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
function screenBalance(data) {
  screen.state.db = data;
  return vm.runInContext('totalPoints()', screen);
}
function api(route, body, auth = token) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : JSON.stringify(body);
    const headers = auth ? { Authorization: `Bearer ${auth}` } : {};
    if (data !== null) Object.assign(headers, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
    const req = http.request({ hostname: '127.0.0.1', port, path: `/api/punktacja${route}`,
      method: data === null ? 'GET' : 'POST', headers }, res => {
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
async function start() {
  child = fork(path.join(isolated, 'start.cjs'), [], {
    cwd: isolated, env: { ...process.env, OPENAI_API_KEY: '' },
    stdio: ['ignore', 'ignore', 'pipe', 'ipc']
  });
  let errors = '';
  child.stderr.on('data', chunk => { errors += chunk; });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server startup timed out: ${errors}`)), 5000);
    child.once('error', err => { clearTimeout(timer); reject(err); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited (${code}): ${errors}`)); });
    child.once('message', message => { clearTimeout(timer); port = message.port; resolve(); });
  });
}
async function stop() {
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    await exited;
  }
}
async function login() {
  const response = await api('/parent/login', { pin }, null);
  assert.equal(response.status, 200);
  token = response.body.token;
}
async function ask(id = 'r10') { return api('/reward-request', { rewardId: id }, null); }
async function decide(id, action = 'approve', auth = token) { return api('/parent/reward', { id, action }, auth); }

// Keep fixture setup inside each test: Node 18's beforeEach hook accumulates abort listeners.
function balanceTest(name, run) {
  test(name, async () => {
    write(fixture());
    await login();
    await run();
  });
}

// Assert a concrete expected score against the actual frontend functions and both HTTP decisions.
async function checkBalance(data, expected) {
  data.rewards = [{ id: 'exact', name: 'Exact', cost: Math.max(1, expected) }, { id: 'over', name: 'Over', cost: expected + 1 }];
  write(data);
  assert.equal(screenBalance(data), expected);
  const before = fs.readFileSync(dataPath, 'utf8');
  assert.equal((await ask('over')).status, 400);
  assert.equal(fs.readFileSync(dataPath, 'utf8'), before);
  if (expected === 0) {
    data.redemptions.push({ id: 'pending', rewardId: 'exact', cost: 1, status: 'pending' });
    write(data);
    assert.equal((await decide('pending')).status, 400);
    assert.equal(saved().redemptions.at(-1).status, 'pending');
    return;
  }
  const requested = await ask('exact');
  assert.equal(requested.status, 200, JSON.stringify(requested.body));
  assert.equal(screenBalance(requested.body.data), expected, 'Pending does not reserve points');
  const id = requested.body.data.redemptions.at(-1).id;
  const approved = await decide(id);
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  assert.equal(screenBalance(approved.body.data), 0);
}

describe('RF-03 question balance', () => {
  before(async () => {
    isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'rafcio-balance-'));
    dataPath = path.join(isolated, 'punktacja-data.json');
    fs.copyFileSync(path.join(root, 'server.js'), path.join(isolated, 'server.js'));
    fs.cpSync(path.join(root, 'utils'), path.join(isolated, 'utils'), { recursive: true });
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(isolated, 'node_modules'), 'dir');
    // The child process cannot load the project's .env or real game data.
    fs.writeFileSync(path.join(isolated, 'start.cjs'), `const app = require('./server');
const server = app.listen(0, '127.0.0.1', () => process.send({ port: server.address().port }));\n`);
    const frontend = fs.readFileSync(path.join(root, 'public/punktacja/app.js'), 'utf8');
    const names = ['rec', 'taskState', 'dayPoints', 'totalPoints', 'questionDayPoints', 'questionDayStatuses'];
    const functions = names.map(name => {
      const match = frontend.match(new RegExp(`^function ${name}\\([^\\n]+$`, 'm'));
      assert.ok(match, `Frontend function ${name} must be available for comparison`);
      return match[0];
    });
    screen = vm.createContext({ state: { db: null } });
    vm.runInContext(functions.join('\n'), screen);
    await start();
  });
  after(async () => { await stop(); if (isolated) fs.rmSync(isolated, { recursive: true, force: true }); });

  balanceTest('question-only day funds a reward even with no records', async () => {
    await checkBalance(fixture(), 10);
  });
  balanceTest('approves an existing pending reward funded by the question', async () => {
    const data = fixture();
    data.redemptions = [{ id: 'pending', rewardId: 'r10', cost: 10, status: 'pending' }];
    write(data);
    assert.equal((await decide('pending')).status, 200);
    assert.equal(screenBalance(saved()), 0);
  });
  for (const [name, rate, expected] of [
    ['zero', 0, 0], ['fractional', 2.6, 3], ['numeric string', '7', 7],
    ['missing', undefined, 10], ['invalid', 'wrong', 10], ['negative', -2, 10],
    ['non-finite', 'Infinity', 10], ['null', null, 0], ['empty string', '', 0]
  ]) {
    balanceTest(`question rate agrees with the screen: ${name}`, async () => {
      const data = fixture();
      data.settings.questionOfTheDayPoints = rate;
      await checkBalance(data, expected);
    });
  }
  balanceTest('only done questions count; unanswered or unapproved questions add nothing', async () => {
    const data = fixture();
    data.settings.questionOfTheDayStatus = { a: 'missed', b: 'pending', c: true, d: false };
    await checkBalance(data, 0);
  });
  balanceTest('a missing question status map adds nothing', async () => {
    const data = fixture();
    delete data.settings.questionOfTheDayStatus;
    await checkBalance(data, 0);
  });
  balanceTest('multiple question dates and a task on the same day are counted once', async () => {
    const data = fixture();
    data.settings.questionOfTheDayStatus['2026-01-03'] = 'done';
    data.settings.questionOfTheDayStatus['2026-01-04'] = 'missed';
    data.tasks = [{ id: 't', points: 10 }];
    data.records = { '2026-01-02': { tasks: { t: true }, extras: {}, challenges: {} } };
    await checkBalance(data, 30);
  });
  balanceTest('other point sources and deductions keep their existing values', async () => {
    const data = fixture();
    data.tasks = [{ id: 'done', points: 10 }, { id: 'missed', points: 4 }, { id: 'pending', points: 99 }];
    data.extras = [{ id: 'e', points: 5 }];
    data.challenges = [{ id: 'c', points: 20, color: '#168fe8' }];
    data.records = { '2026-01-02': { tasks: { done: true, missed: false }, extras: { e: true }, challenges: { c: true } } };
    data.bonusPoints = [{ points: 3, createdAt: '2026-01-02T12:00:00Z' }];
    data.consequences = [{ points: 2 }];
    data.redemptions = [{ id: 'old', cost: 15, status: 'approved' }, { cost: 100, status: 'rejected' }];
    await checkBalance(data, 27); // 10 - 4 + 5 + 20 + 10 + 3 - 2 - 15
    data.settings.questionOfTheDayStatus = {};
    await checkBalance(data, 17);
  });
  balanceTest('approval deducts once; a duplicate approval cannot change the saved state', async () => {
    const requested = await ask();
    assert.equal(requested.status, 200);
    const id = requested.body.data.redemptions[0].id;
    assert.equal((await decide(id)).status, 200);
    const before = fs.readFileSync(dataPath, 'utf8');
    assert.equal((await decide(id)).status, 404);
    assert.equal(fs.readFileSync(dataPath, 'utf8'), before);
    assert.equal(screenBalance(saved()), 0);
  });
  balanceTest('rejection leaves the points available for another request', async () => {
    const requested = await ask();
    assert.equal(requested.status, 200);
    assert.equal((await decide(requested.body.data.redemptions[0].id, 'reject')).status, 200);
    assert.equal(screenBalance(saved()), 10);
    assert.equal((await ask()).status, 200);
  });
  balanceTest('approval rechecks points after a question is unmarked', async () => {
    const requested = await ask();
    assert.equal(requested.status, 200);
    assert.equal((await api('/parent/settings', { questionOfTheDayStatus: { '2026-01-02': 'missed' } })).status, 200);
    const before = fs.readFileSync(dataPath, 'utf8');
    assert.equal((await decide(requested.body.data.redemptions[0].id)).status, 400);
    assert.equal(fs.readFileSync(dataPath, 'utf8'), before);
    assert.equal(screenBalance(saved()), 0);
  });
  balanceTest('approval without a parent session cannot alter the reward', async () => {
    const requested = await ask();
    assert.equal(requested.status, 200);
    const before = fs.readFileSync(dataPath, 'utf8');
    assert.equal((await decide(requested.body.data.redemptions[0].id, 'approve', null)).status, 401);
    assert.equal(fs.readFileSync(dataPath, 'utf8'), before);
  });
  balanceTest('a real server process restart preserves the reward and balance, but clears sessions', async () => {
    const requested = await ask();
    assert.equal(requested.status, 200);
    assert.equal((await decide(requested.body.data.redemptions[0].id)).status, 200);
    const before = saved();
    await stop();
    await start();
    assert.equal((await api('/parent/session')).status, 401);
    await login();
    const reread = await api('');
    assert.equal(reread.status, 200);
    assert.equal(screenBalance(reread.body), 0);
    assert.deepEqual(saved(), before);
    assert.equal((await ask()).status, 400);
  });
});
