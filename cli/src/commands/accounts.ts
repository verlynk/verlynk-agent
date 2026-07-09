import { getAPI } from '../config.js';

export async function listAccounts(argv: {
  platform?: string;
  'profile-id'?: string;
  'include-over-limit'?: boolean;
  json?: boolean;
}) {
  const api = getAPI();

  let data;
  try {
    data = await api.listAccounts({
      platform: argv.platform,
      profileId: argv['profile-id'],
      includeOverLimit: argv['include-over-limit'],
    });
  } catch (err: unknown) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const accounts = data.accounts;

  if (argv.json) {
    console.log(JSON.stringify(accounts, null, 2));
    return;
  }

  if (accounts.length === 0) {
    console.log('No connected accounts found.');
    return;
  }

  const COL = {
    id: 36,
    platform: 14,
    displayName: 24,
    username: 20,
    status: 8,
  };

  const header =
    'ID'.padEnd(COL.id) +
    'Platform'.padEnd(COL.platform) +
    'Display Name'.padEnd(COL.displayName) +
    'Username'.padEnd(COL.username) +
    'Active';

  const divider = '-'.repeat(header.length);

  console.log(header);
  console.log(divider);

  for (const acc of accounts) {
    const row =
      acc._id.padEnd(COL.id) +
      acc.platform.padEnd(COL.platform) +
      (acc.displayName || '').substring(0, COL.displayName - 2).padEnd(COL.displayName) +
      (acc.username || '').substring(0, COL.username - 2).padEnd(COL.username) +
      (acc.isActive ? 'yes' : 'no');
    console.log(row);
  }

  console.log('');
  console.log(`${accounts.length} account(s) listed.`);
}
