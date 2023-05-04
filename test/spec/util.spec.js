import test from 'ava';
import {formatDate, addTime, parseStartTime, filterArgs} from '../../util.js';

test('utils.formatDate', t => {
  const DATE = '2014-03-05T11:15:00.000Z';
  t.is(formatDate(new Date(DATE)), DATE);
  const LOCALDATE = '2000-01-01T08:59:59.999+09:00';
  const UTC = '1999-12-31T23:59:59.999Z';
  t.is(formatDate(new Date(LOCALDATE)), UTC);
});

test('utils.addTime', t => {
  const D1 = '2014-03-05T11:15:00.000Z';
  const D2 = '2014-03-05T12:15:00.000Z';
  t.is(addTime(new Date(D1), 3600).getTime(), new Date(D2).getTime());
  const D3 = '2014-03-05T10:15:00.000Z';
  t.is(addTime(new Date(D1), -3600).getTime(), new Date(D3).getTime());
});

test('utils.parseStartTime', t => {
  const D1 = '2014-03-05T11:15:00.000Z';
  const D2 = '2014-03-05T11:45:00.000Z';
  const currentTime = new Date(D1);
  t.is(parseStartTime('30m', currentTime).getTime(), new Date(D2).getTime());
  const D3 = '2014-03-05T13:15:00.000Z';
  t.is(parseStartTime('2h', currentTime).getTime(), new Date(D3).getTime());
  t.is(parseStartTime(D1).getTime(), currentTime.getTime());
  try {
    parseStartTime('nm', currentTime);
    t.fail(`parseStartTime should throw an exception in response to "nm"`);
  } catch {
    t.pass();
  }
  try {
    parseStartTime('nh', currentTime);
    t.fail(`parseStartTime should throw an exception in response to "nh"`);
  } catch {
    t.pass();
  }
  try {
    parseStartTime('Tokyo', currentTime);
    t.fail(`parseStartTime should throw an exception in response to "Tokyo"`);
  } catch {
    t.pass();
  }
});

test('utils.filterArgs', t => {
  const now = new Date(0);
  const args = {
    currentTime: new Date(now.getTime() + 15_000),
    dryRun: false,
    eventId: 0,
    consumptionStartTime: null,
    duration: 0,
  };

  let argv = ['--avail-start', '10m', '--avail-duration', '30'];
  t.deepEqual(filterArgs(argv, now), Object.assign({...args}, {consumptionStartTime: new Date(615_000), duration: 30}));
  argv = ['--avail-start', '10m', '--avail-duration', '30', '--avail-id', '128'];
  t.deepEqual(filterArgs(argv, now), Object.assign({...args}, {consumptionStartTime: new Date(615_000), duration: 30, eventId: 128}));
  argv = ['--dry-run', '--avail-start', '10m', '--avail-duration', '30'];
  t.deepEqual(filterArgs(argv, now), Object.assign({...args}, {consumptionStartTime: new Date(615_000), duration: 30, dryRun: true}));
  try {
    filterArgs([]);
    filterArgs(['--avail-start', '10m']);
    filterArgs(['--avail-duration', '30']);
    filterArgs(['--dry-run']);
    t.fail('--avail-start and --avail-duration are required.');
  } catch {
    t.pass();
  }
});
