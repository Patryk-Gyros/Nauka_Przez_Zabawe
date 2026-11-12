const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../public/punktacja/app.js'), 'utf8');
// Run the real calculation and renderer without starting the app or reading any game data.
function functionCode(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing frontend function: ${name}`);
  const firstLineEnd = source.indexOf('\n', start);
  if (source.slice(start, firstLineEnd).trimEnd().endsWith('}')) return source.slice(start, firstLineEnd);
  const end = source.indexOf('\n}', firstLineEnd);
  assert.ok(end > start, `Missing function end: ${name}`);
  return source.slice(start, end + 2);
}
const functions = ['rec', 'taskState', 'questionDayPoints', 'questionDayStatuses',
  'rafciaPositiveLifetimePoints', 'rafciaPerfectDay', 'rafciaStreakStats', 'renderRafciaExpedition'].map(functionCode);
const constants = ['dateKey', 'parseDate', 'esc'].map(name => source.match(new RegExp(`^const ${name}=[^\\n]+`, 'm'))[0]);
for (const name of ['rafciaTravelerLevels', 'rafciaMountainGoals']) {
  constants.push(source.match(new RegExp(`^const ${name}=\\[[\\s\\S]*?^\\];`, 'm'))[0]);
}
class TestDate extends Date {
  constructor(...args) { super(...(args.length ? args : [2026, 0, 6, 12])); }
}
function fixture() {
  return { settings: { startDate: '2026-01-01', questionOfTheDayPoints: 10,
    questionOfTheDayStatus: { '2026-01-06': 'done' } },
    records: {}, tasks: [], extras: [], challenges: [], bonusPoints: [], redemptions: [], consequences: [] };
}
function screen(data) {
  const panels = { innerHTML: '', querySelectorAll: () => [] };
  const title = { textContent: '' };
  const context = vm.createContext({ state: { db: data }, Date: TestDate,
    $: id => id === 'rafciaExpeditionPanels' ? panels : title,
    rafciaSvg: () => '', rafciaMountainArt: () => '', rafciaMysteryArt: () => '' });
  vm.runInContext([...constants, ...functions].join('\n'), context);
  return { context, points: () => context.rafciaPositiveLifetimePoints(),
    render: () => { context.renderRafciaExpedition(); return panels.innerHTML; } };
}

test('a day with only a completed question contributes to expedition progress', () => {
  assert.equal(screen(fixture()).points(), 10);
});

test('completed questions also work when the records property is absent', () => {
  const data = fixture();
  delete data.records;
  assert.equal(screen(data).points(), 10);
});

test('unapproved and unanswered questions do not contribute', () => {
  const data = fixture();
  data.settings.questionOfTheDayStatus = { a: 'missed', b: 'pending', c: true, d: false };
  assert.equal(screen(data).points(), 0);
  delete data.settings.questionOfTheDayStatus;
  assert.equal(screen(data).points(), 0);
});

test('a question and a task on the same date are counted once each', () => {
  const data = fixture();
  data.tasks = [{ id: 't', points: 10 }];
  data.records['2026-01-06'] = { tasks: { t: true }, extras: {}, challenges: {} };
  assert.equal(screen(data).points(), 20);
});

test('the union of question dates and record dates preserves all positive sources', () => {
  const data = fixture();
  data.settings.questionOfTheDayStatus['2026-01-05'] = 'done';
  data.tasks = [{ id: 't', points: 10 }, { id: 'missed', points: 4 }];
  data.extras = [{ id: 'e', points: 5 }];
  data.challenges = [{ id: 'c', points: 20 }];
  data.records['2026-01-05'] = { tasks: { t: true, missed: false }, extras: { e: true }, challenges: { c: true } };
  data.bonusPoints = [{ points: 3 }, { points: -2 }];
  assert.equal(screen(data).points(), 58); // 10 + 5 + 20 + two questions at 10 + bonus 3
});

test('rewards and consequences do not subtract expedition progress', () => {
  const data = fixture();
  data.redemptions = [{ status: 'approved', cost: 100 }];
  data.consequences = [{ points: 50 }];
  assert.equal(screen(data).points(), 10);
});

test('question rates keep existing zero, rounding and default behavior', () => {
  for (const [rate, expected] of [[0, 0], [2.6, 3], [undefined, 10], ['invalid', 10]]) {
    const data = fixture();
    data.settings.questionOfTheDayPoints = rate;
    assert.equal(screen(data).points(), expected, String(rate));
  }
});

test('recalculating or unmarking a question does not mutate or duplicate saved points', () => {
  const data = fixture();
  const view = screen(data);
  const before = JSON.stringify(data);
  assert.equal(view.points(), 10);
  assert.equal(view.points(), 10);
  view.render();
  assert.equal(JSON.stringify(data), before);
  data.settings.questionOfTheDayStatus['2026-01-06'] = 'missed';
  assert.equal(view.points(), 0);
});

test('question-only points unlock each mountain exactly at its existing threshold', () => {
  const data = fixture();
  data.settings.questionOfTheDayPoints = 1;
  const view = screen(data);
  const thresholds = vm.runInContext('rafciaMountainGoals.map(x => x.points)', view.context);
  thresholds.forEach((threshold, index) => {
    data.bonusPoints = [{ points: threshold - 1 }];
    data.settings.questionOfTheDayStatus['2026-01-06'] = 'missed';
    assert.equal((view.render().match(/data-expedition-kind="mountain"/g) || []).length, index);
    data.settings.questionOfTheDayStatus['2026-01-06'] = 'done';
    assert.equal((view.render().match(/data-expedition-kind="mountain"/g) || []).length, index + 1);
  });
});

test('a question-only day does not create an ideal day or extend the equipment streak', () => {
  const data = fixture();
  data.tasks = [{ id: 't', points: 10 }];
  for (let day = 1; day <= 5; day++) data.records[`2026-01-0${day}`] = { tasks: { t: true } };
  const view = screen(data);
  assert.equal(view.context.rafciaPerfectDay('2026-01-06'), false);
  assert.equal(view.context.rafciaStreakStats().current, 5);
  assert.equal(view.context.rafciaStreakStats().best, 5);
  assert.equal((view.render().match(/data-expedition-kind="gear"/g) || []).length, 1);
  data.settings.questionOfTheDayStatus = {};
  assert.equal(view.context.rafciaStreakStats().current, 5);
  assert.equal(view.context.rafciaStreakStats().best, 5);
});
