import { readFileSync, existsSync, mkdirSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { VerlynkAPI, UserOrg } from './api.js';

export const CREDENTIALS_DIR = join(homedir(), '.verlynk');
export const CREDENTIALS_FILE = join(CREDENTIALS_DIR, 'credentials.json');

export interface StoredCredentials {
  apiKey: string;
  apiUrl?: string;
  profileId?: string;
}

export function loadCredentials(): StoredCredentials | null {
  try {
    if (!existsSync(CREDENTIALS_FILE)) return null;
    const data = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8')) as StoredCredentials;
    if (!data.apiKey) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveCredentials(creds: StoredCredentials): void {
  if (!existsSync(CREDENTIALS_DIR)) {
    mkdirSync(CREDENTIALS_DIR, { recursive: true });
  }
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
  try {
    chmodSync(CREDENTIALS_FILE, 0o600);
  } catch {
    // chmod may not work on Windows — not fatal
  }
}

export function getConfig(): { apiKey: string; apiUrl?: string } {
  const creds = loadCredentials();
  if (creds) return creds;

  const envKey = process.env.VERLYNK_API_KEY;
  if (envKey) {
    return { apiKey: envKey, apiUrl: process.env.VERLYNK_API_URL };
  }

  console.error('Error: No authentication found.');
  console.error('Options:');
  console.error('  1. Run: verlynk auth:login --key <your-api-key>');
  console.error('  2. Set: export VERLYNK_API_KEY=your_api_key');
  process.exit(1);
}

export function getAPI(): VerlynkAPI {
  const config = getConfig();
  return new VerlynkAPI(config);
}

/** Pick profile (project) ID from GET /v1/user response. */
export function pickProfileIdFromUserContext(
  orgs: UserOrg[],
  explicit?: string
): string | undefined {
  if (explicit) return explicit;

  const org = orgs.find((o) => o.isDefaultOrg) ?? orgs[0];
  if (!org) return undefined;

  if (org.defaultProject) return org.defaultProject;

  const markedDefault = org.projects.find((p) => p.isDefaultProject);
  if (markedDefault) return markedDefault.projectId;

  if (org.projects.length === 1) return org.projects[0]?.projectId;

  return undefined;
}

function printProfilePickerHint(orgs: UserOrg[]): void {
  console.error('');
  console.error('Available profiles:');
  for (const org of orgs) {
    for (const project of org.projects) {
      const marker = project.isDefaultProject ? ' [default]' : '';
      console.error(`  ${project.projectName}: ${project.projectId}${marker}`);
    }
  }
  console.error('');
  console.error('Fix options:');
  console.error('  1. Pass --profile-id <uuid> on the command');
  console.error('  2. Set VERLYNK_PROFILE_ID=<uuid>');
  console.error('  3. Re-login: verlynk auth:login --key <key> --profile-id <uuid>');
}

/** Resolve profileId for post endpoints (required when org has multiple profiles). */
export async function resolveProfileId(explicit?: string): Promise<string> {
  if (explicit) return explicit;

  const envProfile = process.env.VERLYNK_PROFILE_ID;
  if (envProfile) return envProfile;

  const creds = loadCredentials();
  if (creds?.profileId) return creds.profileId;

  const api = getAPI();
  let orgs: UserOrg[];
  try {
    orgs = await api.getUserContext();
  } catch (err: unknown) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const profileId = pickProfileIdFromUserContext(orgs);
  if (profileId) return profileId;

  console.error(
    'Error: Your organization has multiple profiles and no default could be resolved.'
  );
  printProfilePickerHint(orgs);
  process.exit(1);
}
