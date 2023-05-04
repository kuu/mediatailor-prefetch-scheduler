#!/usr/bin/env node

import process from 'node:process';
import {readFile} from 'node:fs/promises';
import {filterArgs, checkConfig} from './util.js';
import {schedulePrefetch} from './index.js';

try {
  const args = filterArgs(process.argv.slice(2), new Date());
  const config = JSON.parse(await readFile('./config.json'));
  checkConfig(config);
  schedulePrefetch(args, config);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

