export function formatDate(dt) {
  const y = dt.getUTCFullYear();
  const m = `00${dt.getUTCMonth() + 1}`.slice(-2);
  const d = `00${dt.getUTCDate()}`.slice(-2);
  const h = `00${dt.getUTCHours()}`.slice(-2);
  const min = `00${dt.getUTCMinutes()}`.slice(-2);
  const sec = `00${dt.getUTCSeconds()}`.slice(-2);
  const msec = `000${dt.getUTCMilliseconds()}`.slice(-3);
  return `${y}-${m}-${d}T${h}:${min}:${sec}.${msec}Z`;
}

export function addTime(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}

export function parseStartTime(text, currentTime) {
  if (text.endsWith('m')) {
    const minutes = Number.parseInt(text, 10);
    if (Number.isNaN(minutes)) {
      throw new TypeError(`Invalid start time: "${text}"`);
    }
    return addTime(currentTime, minutes * 60);
  }

  if (text.endsWith('h')) {
    const hours = Number.parseInt(text, 10);
    if (Number.isNaN(hours)) {
      throw new TypeError(`Invalid start time: "${text}"`);
    }
    return addTime(currentTime, hours * 3600);
  }

  const startTime = new Date(text);
  if (Number.isNaN(startTime.valueOf())) {
    throw new TypeError(`Invalid start time: "${text}"`);
  }
  return startTime;
}

export function filterArgs(argv, now) {
  const args = {
    currentTime: new Date(now.getTime() + 15_000),
    dryRun: false,
    eventId: 0,
    consumptionStartTime: null,
    duration: 0,
  };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') {
      args.dryRun = true;
    } else if (argv[i] === '--avail-id') {
      const num = Number.parseInt(argv[++i], 10);
      if (!Number.isNaN(num)) {
        args.eventId = num;
      }
    } else if (argv[i] === '--avail-start') {
      args.consumptionStartTime = parseStartTime(argv[++i], args.currentTime);
    } else if (argv[i] === '--avail-duration') {
      const num = Number.parseInt(argv[++i], 10);
      if (!Number.isNaN(num)) {
        args.duration = num;
      }
    }
  }

  if (!args.consumptionStartTime || args.duration === 0) {
    throw new Error('--avail-start and --avail-duration are required.');
  }

  return args;
}

export function checkConfig(config) {
  if (!config || !config.region || !config.channelId || !config.originId) {
    throw new Error('region, channelId (MediaLive\'s channel) and originId (MediaTailor\'s config name) must be defined in ./config.json.');
  }
}
