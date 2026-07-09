import { getAPI } from '../config.js';
import { fail, printJson, truncate } from '../cli.js';
import type { ValidatePostLengthResponse } from '../api.js';

function toRows(resp: ValidatePostLengthResponse) {
  return Object.entries(resp.platforms).map(([platform, v]) => ({
    platform,
    count: v.count,
    limit: v.limit,
    valid: v.valid,
  }));
}

function printTable(resp: ValidatePostLengthResponse) {
  const rows = toRows(resp).sort((a, b) => Number(a.valid) - Number(b.valid));
  const COL = { platform: 18, count: 10, limit: 10, valid: 6 };
  const header =
    'Platform'.padEnd(COL.platform) +
    'Count'.padEnd(COL.count) +
    'Limit'.padEnd(COL.limit) +
    'Valid';
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const r of rows) {
    const row =
      truncate(r.platform, COL.platform - 2).padEnd(COL.platform) +
      String(r.count).padEnd(COL.count) +
      String(r.limit).padEnd(COL.limit) +
      (r.valid ? 'yes' : 'no');
    console.log(row);
  }
}

export async function validate(argv: { text: string; json?: boolean; strict?: boolean }) {
  const api = getAPI();
  try {
    const resp = await api.validatePostLength({ text: argv.text });
    if (argv.json) {
      printJson(resp);
      return;
    }

    printTable(resp);
    const anyInvalid = Object.values(resp.platforms).some((p) => !p.valid);
    if (argv.strict && anyInvalid) process.exit(1);
  } catch (err: unknown) {
    fail(err);
  }
}

