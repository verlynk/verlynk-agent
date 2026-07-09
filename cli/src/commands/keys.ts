import { getAPI } from '../config.js';
import { fail, isUuid, printJson, requireYes, truncate } from '../cli.js';
import type { ApiKey, CreateApiKeyRequest } from '../api.js';

function printKeysTable(keys: ApiKey[]) {
  const COL = { id: 36, name: 24, permission: 14, scope: 10, expires: 24, created: 24 };
  const header =
    'ID'.padEnd(COL.id) +
    'Name'.padEnd(COL.name) +
    'Permission'.padEnd(COL.permission) +
    'Scope'.padEnd(COL.scope) +
    'Expires'.padEnd(COL.expires) +
    'Created';

  console.log(header);
  console.log('-'.repeat(header.length));

  for (const key of keys) {
    const row =
      key.id.padEnd(COL.id) +
      truncate(key.name, COL.name - 2).padEnd(COL.name) +
      key.permission.padEnd(COL.permission) +
      key.scope.padEnd(COL.scope) +
      (key.expiresAt || 'never').substring(0, COL.expires - 2).padEnd(COL.expires) +
      key.createdAt;
    console.log(row);
  }

  console.log('');
  console.log(`${keys.length} API key(s) listed.`);
}

export async function listKeys(argv: { json?: boolean }) {
  const api = getAPI();
  try {
    const { apiKeys } = await api.listApiKeys();
    if (argv.json) {
      printJson(apiKeys);
      return;
    }
    if (apiKeys.length === 0) {
      console.log('No API keys found.');
      return;
    }
    printKeysTable(apiKeys);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function createKey(argv: {
  name: string;
  permission?: 'read' | 'read-write';
  scope?: 'full' | 'profiles';
  'profile-ids'?: string;
  'expires-in'?: number;
  json?: boolean;
}) {
  if (argv.scope === 'profiles' && !argv['profile-ids']) {
    console.error('Error: --profile-ids is required when --scope is profiles.');
    process.exit(1);
  }

  const body: CreateApiKeyRequest = {
    name: argv.name,
    permission: argv.permission || 'read-write',
    scope: argv.scope || 'full',
  };

  if (argv['expires-in']) body.expiresIn = argv['expires-in'];
  if (argv['profile-ids']) {
    body.profileIds = argv['profile-ids']
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  const api = getAPI();
  try {
    const result = await api.createApiKey(body);
    if (argv.json) {
      printJson(result);
      return;
    }

    console.log(result.message || 'API key created successfully.');
    console.log(`ID:       ${result.apiKey.id}`);
    console.log(`Name:     ${result.apiKey.name}`);
    console.log(`Key:      ${result.apiKey.key}`);
    console.log(`Expires:  ${result.apiKey.expiresAt || 'never'}`);
    console.log('');
    console.log('Store this key now — it cannot be retrieved again.');
  } catch (err: unknown) {
    fail(err);
  }
}

export async function deleteKey(argv: { keyId: string; yes?: boolean }) {
  if (!isUuid(argv.keyId)) {
    console.error('Error: keyId must be a UUID.');
    process.exit(1);
  }

  requireYes(argv, `delete API key ${argv.keyId}`);
  const api = getAPI();
  try {
    const result = await api.deleteApiKey(argv.keyId);
    console.log(result.message || `API key ${argv.keyId} deleted successfully.`);
  } catch (err: unknown) {
    fail(err);
  }
}
