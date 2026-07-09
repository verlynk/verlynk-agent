import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  unlinkSync,
  chmodSync,
} from 'fs';
import { VerlynkAPI } from '../api.js';
import {
  CREDENTIALS_DIR,
  CREDENTIALS_FILE,
  loadCredentials,
  pickProfileIdFromUserContext,
  StoredCredentials,
} from '../config.js';

function saveCredentials(creds: StoredCredentials): void {
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

function deleteCredentials(): void {
  if (existsSync(CREDENTIALS_FILE)) {
    unlinkSync(CREDENTIALS_FILE);
  }
}

function readKeyFromStdin(): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write('Enter your Verlynk API key: ');
    let input = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (char: string) => {
      if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        resolve(input.trim());
      } else if (char === '\u0003') {
        process.exit(1);
      } else if (char === '\u007f') {
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        input += char;
        process.stdout.write('*');
      }
    });
  });
}

export async function authLogin(argv: { key?: string; 'api-url'?: string; 'profile-id'?: string }) {
  let apiKey = argv.key;

  if (!apiKey) {
    try {
      apiKey = await readKeyFromStdin();
    } catch {
      // stdin not a TTY (e.g. piped input), read plain
      process.stdout.write('Enter your Verlynk API key: ');
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      apiKey = Buffer.concat(chunks).toString('utf8').trim();
    }
  }

  if (!apiKey) {
    console.error('Error: API key is required.');
    process.exit(1);
  }

  console.log('Verifying API key...');

  const api = new VerlynkAPI({ apiKey, apiUrl: argv['api-url'] });

  let orgs;
  try {
    orgs = await api.getUserContext();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Authentication failed: ${msg}`);
    process.exit(1);
  }

  const profileId = pickProfileIdFromUserContext(orgs, argv['profile-id']);

  saveCredentials({
    apiKey,
    apiUrl: argv['api-url'],
    ...(profileId ? { profileId } : {}),
  });

  console.log('Authenticated successfully.');
  console.log(`Credentials saved to ${CREDENTIALS_FILE}`);
  if (profileId) {
    console.log(`Default profile: ${profileId}`);
  } else {
    console.log('');
    console.log(
      'Warning: Multiple profiles found with no default. Post commands require --profile-id'
    );
    console.log('  or: verlynk auth:login --key <key> --profile-id <uuid>');
  }
  console.log('');

  for (const org of orgs) {
    console.log(`Organization: ${org.orgName} (${org.orgId})`);
    for (const project of org.projects) {
      const marker = project.isDefaultProject ? ' [default]' : '';
      console.log(`  Profile: ${project.projectName} — ${project.projectId}${marker}`);
    }
  }
}

export async function authLogout() {
  const creds = loadCredentials();
  if (!creds) {
    console.log('No stored credentials found.');
    return;
  }
  deleteCredentials();
  console.log('Credentials removed successfully.');
}

export async function authStatus() {
  const creds = loadCredentials();
  const envKey = process.env.VERLYNK_API_KEY;

  let apiKey: string;
  let apiUrl: string | undefined;

  if (creds) {
    console.log('Authentication method: Stored credentials');
    console.log(`Key preview:           ${creds.apiKey.substring(0, 12)}...`);
    console.log(`Credentials file:      ${CREDENTIALS_FILE}`);
    if (creds.profileId) {
      console.log(`Saved profile:         ${creds.profileId}`);
    }
    apiKey = creds.apiKey;
    apiUrl = creds.apiUrl;
  } else if (envKey) {
    console.log('Authentication method: Environment variable (VERLYNK_API_KEY)');
    console.log(`Key preview:           ${envKey.substring(0, 12)}...`);
    apiKey = envKey;
    apiUrl = process.env.VERLYNK_API_URL;
  } else {
    console.log('Not authenticated.');
    console.log('');
    console.log('Options:');
    console.log('  1. verlynk auth:login --key <your-api-key>');
    console.log('  2. export VERLYNK_API_KEY=your_api_key');
    return;
  }

  console.log('');
  console.log('Verifying credentials...');

  const api = new VerlynkAPI({ apiKey, apiUrl });
  try {
    const orgs = await api.getUserContext();
    console.log('Credentials are valid.');
    console.log('');
    for (const org of orgs) {
      console.log(`Organization: ${org.orgName} (${org.orgId})`);
      for (const project of org.projects) {
        const marker = project.isDefaultProject ? ' [default]' : '';
        console.log(`  Profile: ${project.projectName} — ${project.projectId}${marker}`);
        console.log(`  Channels: ${project.channelIds.length} connected`);
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Credentials are invalid or expired: ${msg}`);
    console.error('Run: verlynk auth:login --key <your-api-key>');
  }
}
