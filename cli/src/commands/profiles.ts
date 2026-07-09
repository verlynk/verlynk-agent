import { getAPI, loadCredentials, saveCredentials } from '../config.js';
import { fail, isUuid, printJson, requireYes, truncate } from '../cli.js';
import type { Profile } from '../api.js';

function printProfilesTable(profiles: Profile[], activeProfileId?: string) {
  const COL = { id: 36, name: 22, def: 14, over: 10, created: 24 };
  const showOverLimit = profiles.some((p) => p.isOverLimit !== undefined);

  const header =
    'ID'.padEnd(COL.id) +
    'Name'.padEnd(COL.name) +
    'Default'.padEnd(COL.def) +
    (showOverLimit ? 'OverLimit'.padEnd(COL.over) : '') +
    'Created At';

  console.log(header);
  console.log('-'.repeat(header.length));

  for (const p of profiles) {
    let def = '';
    if (p.isDefault) def = 'api';
    else if (activeProfileId && p._id === activeProfileId) def = 'cli';

    const over = showOverLimit ? String(Boolean(p.isOverLimit)).padEnd(COL.over) : '';
    const row =
      p._id.padEnd(COL.id) +
      truncate(p.name || '', COL.name - 2).padEnd(COL.name) +
      def.padEnd(COL.def) +
      over +
      (p.createdAt || '');
    console.log(row);
  }

  console.log('');
  console.log(`${profiles.length} profile(s) listed.`);
  if (activeProfileId) console.log(`Active CLI profile: ${activeProfileId}`);
}

export async function listProfiles(argv: {
  'include-over-limit'?: boolean;
  json?: boolean;
}) {
  const api = getAPI();
  const creds = loadCredentials();

  try {
    const { profiles } = await api.listProfiles({
      includeOverLimit: argv['include-over-limit'],
    });

    if (argv.json) {
      printJson(profiles);
      return;
    }

    if (profiles.length === 0) {
      console.log('No profiles found.');
      return;
    }

    printProfilesTable(profiles, creds?.profileId);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function getProfile(argv: { profileId: string; json?: boolean }) {
  if (!isUuid(argv.profileId)) {
    console.error('Error: profileId must be a UUID.');
    process.exit(1);
  }

  const api = getAPI();
  try {
    const { profile } = await api.getProfile(argv.profileId);
    if (argv.json) {
      printJson(profile);
      return;
    }

    console.log(`Profile ID:   ${profile._id}`);
    console.log(`Name:         ${profile.name}`);
    if (profile.description) console.log(`Description:  ${profile.description}`);
    console.log(`Default:      ${profile.isDefault ? 'yes' : 'no'}`);
    console.log(`Created At:   ${profile.createdAt}`);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function useProfile(argv: { profileId: string }) {
  if (!isUuid(argv.profileId)) {
    console.error('Error: profileId must be a UUID.');
    process.exit(1);
  }

  const creds = loadCredentials();
  if (!creds) {
    console.error('Error: No stored credentials found.');
    console.error('If you authenticate via environment variables, set: VERLYNK_PROFILE_ID=<uuid>');
    console.error('Or store credentials using: verlynk auth:login --key <your-api-key>');
    process.exit(1);
  }

  const api = getAPI();
  try {
    const { profile } = await api.getProfile(argv.profileId);
    saveCredentials({ ...creds, profileId: profile._id });
    console.log(`Default profile set to ${profile.name} (${profile._id})`);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function createProfile(argv: {
  name: string;
  description?: string;
  json?: boolean;
}) {
  const api = getAPI();
  try {
    const result = await api.createProfile({
      name: argv.name,
      ...(argv.description ? { description: argv.description } : {}),
    });

    if (argv.json) {
      printJson(result);
      return;
    }

    console.log(result.message || 'Profile created successfully.');
    console.log(`Profile ID:   ${result.profile._id}`);
    console.log(`Name:         ${result.profile.name}`);
    console.log('');
    console.log(`Set as CLI default: verlynk profiles:use ${result.profile._id}`);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function updateProfileCmd(argv: {
  profileId: string;
  name?: string;
  description?: string;
  default?: boolean;
  json?: boolean;
}) {
  if (!isUuid(argv.profileId)) {
    console.error('Error: profileId must be a UUID.');
    process.exit(1);
  }

  const body: { name?: string; description?: string; isDefault?: boolean } = {};
  if (argv.name !== undefined) body.name = argv.name;
  if (argv.description !== undefined) body.description = argv.description;
  if (argv.default !== undefined) body.isDefault = argv.default;

  const api = getAPI();
  try {
    const result = await api.updateProfile(argv.profileId, body);
    if (argv.json) {
      printJson(result);
      return;
    }
    console.log(`Profile updated: ${result.profile.name} (${result.profile._id})`);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function deleteProfileCmd(argv: { profileId: string; yes?: boolean }) {
  if (!isUuid(argv.profileId)) {
    console.error('Error: profileId must be a UUID.');
    process.exit(1);
  }

  requireYes(argv, `delete profile ${argv.profileId}`);

  const api = getAPI();
  const creds = loadCredentials();

  try {
    const result = await api.deleteProfile(argv.profileId);
    if (creds?.profileId === argv.profileId) {
      const { profileId: _, ...rest } = creds;
      saveCredentials(rest);
      console.log('Cleared saved CLI default profile.');
    }
    console.log(result.message || `Profile ${argv.profileId} deleted successfully.`);
  } catch (err: unknown) {
    fail(err);
  }
}
