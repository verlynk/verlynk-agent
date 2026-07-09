import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { Argv } from 'yargs';
import { authLogin, authLogout, authStatus } from './commands/auth.js';
import { listAccounts, disconnectAccount } from './commands/accounts.js';
import {
  listProfiles,
  getProfile,
  useProfile,
  createProfile,
  updateProfileCmd,
  deleteProfileCmd,
} from './commands/profiles.js';
import { listKeys, createKey, deleteKey } from './commands/keys.js';
import { analyticsPost, analyticsBestTime } from './commands/analytics.js';
import { usage } from './commands/usage.js';
import { validate } from './commands/validate.js';
import { updateDraft, deleteDraft } from './commands/drafts.js';
import {
  listPosts,
  getPost,
  createPost,
  listDraftPosts,
  deletePost,
  retryPost,
  updatePost,
} from './commands/posts.js';

yargs(hideBin(process.argv))
  .scriptName('verlynk')
  .usage('$0 <command> [options]')
  .command(
    'auth:login',
    'Save and verify your Verlynk API key',
    (y: Argv) =>
      y
        .option('key', {
          describe: 'Verlynk API key (verlynk_...)',
          type: 'string',
        })
        .option('api-url', {
          describe: 'Custom API base URL',
          type: 'string',
        })
        .option('profile-id', {
          describe: 'Default profile (project) UUID to save for post commands',
          type: 'string',
        })
        .example('$0 auth:login --key verlynk_xxx', 'Login with API key'),
    authLogin as never
  )
  .command('auth:logout', 'Remove stored credentials', {}, authLogout as never)
  .command('auth:status', 'Show authentication status', {}, authStatus as never)
  .command(
    'accounts:list',
    'List connected social accounts',
    (y: Argv) =>
      y
        .option('platform', {
          describe: 'Filter by platform (linkedin, x, instagram, etc.)',
          type: 'string',
        })
        .option('profile-id', {
          describe: 'Profile (project) UUID',
          type: 'string',
        })
        .option('include-over-limit', {
          describe: 'Include accounts from over-limit profiles',
          type: 'boolean',
          default: false,
        })
        .option('json', {
          describe: 'Output raw JSON',
          type: 'boolean',
          default: false,
        })
        .example('$0 accounts:list', 'List all accounts')
        .example('$0 accounts:list --platform linkedin', 'List LinkedIn accounts only'),
    listAccounts as never
  )
  .command(
    'accounts:disconnect <accountId>',
    'Disconnect a social account',
    (y: Argv) =>
      y
        .positional('accountId', { describe: 'Account UUID from accounts:list', type: 'string' })
        .option('yes', { alias: 'y', describe: 'Confirm disconnect', type: 'boolean', default: false })
        .example('$0 accounts:disconnect abc123-... --yes', 'Disconnect an account'),
    disconnectAccount as never
  )
  .command(
    'profiles:list',
    'List profiles (projects)',
    (y: Argv) =>
      y
        .option('include-over-limit', {
          describe: 'Include profiles beyond plan limits',
          type: 'boolean',
          default: false,
        })
        .option('json', {
          describe: 'Output raw JSON',
          type: 'boolean',
          default: false,
        })
        .example('$0 profiles:list', 'List profiles'),
    listProfiles as never
  )
  .command(
    'profiles:get <profileId>',
    'Get a profile by ID',
    (y: Argv) =>
      y
        .positional('profileId', { describe: 'Profile UUID', type: 'string' })
        .option('json', {
          describe: 'Output raw JSON',
          type: 'boolean',
          default: false,
        })
        .example('$0 profiles:get abc123-...', 'Get profile details'),
    getProfile as never
  )
  .command(
    'profiles:use <profileId>',
    'Set default profile for CLI',
    (y: Argv) =>
      y
        .positional('profileId', { describe: 'Profile UUID', type: 'string' })
        .example('$0 profiles:use abc123-...', 'Save default profile to credentials'),
    useProfile as never
  )
  .command(
    'profiles:create',
    'Create a new profile',
    (y: Argv) =>
      y
        .option('name', { describe: 'Profile name (3-30 chars)', type: 'string', demandOption: true })
        .option('description', { describe: 'Optional description', type: 'string' })
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .example('$0 profiles:create --name "Marketing Team"', 'Create a profile'),
    createProfile as never
  )
  .command(
    'profiles:update <profileId>',
    'Update a profile',
    (y: Argv) =>
      y
        .positional('profileId', { describe: 'Profile UUID', type: 'string' })
        .option('name', { describe: 'New profile name', type: 'string' })
        .option('description', { describe: 'New description', type: 'string' })
        .option('default', { describe: 'Set as default profile', type: 'boolean' })
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .check((argv) => {
          if (argv.name === undefined && argv.description === undefined && argv.default === undefined) {
            throw new Error('At least one of --name, --description, or --default is required');
          }
          return true;
        })
        .example('$0 profiles:update <id> --description "Updated"', 'Update profile description'),
    updateProfileCmd as never
  )
  .command(
    'profiles:delete <profileId>',
    'Delete a profile',
    (y: Argv) =>
      y
        .positional('profileId', { describe: 'Profile UUID', type: 'string' })
        .option('yes', { alias: 'y', describe: 'Confirm deletion', type: 'boolean', default: false })
        .example('$0 profiles:delete abc123-... --yes', 'Delete a profile'),
    deleteProfileCmd as never
  )
  .command(
    'keys:list',
    'List organization API keys',
    (y: Argv) =>
      y
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .example('$0 keys:list', 'List API keys'),
    listKeys as never
  )
  .command(
    'keys:create',
    'Create an API key',
    (y: Argv) =>
      y
        .option('name', { describe: 'Key label', type: 'string', demandOption: true })
        .option('permission', {
          describe: 'Key permission',
          type: 'string',
          choices: ['read', 'read-write'],
          default: 'read-write',
        })
        .option('scope', {
          describe: 'Profile access mode',
          type: 'string',
          choices: ['full', 'profiles'],
          default: 'full',
        })
        .option('profile-ids', {
          describe: 'Comma-separated profile UUIDs (required when scope=profiles)',
          type: 'string',
        })
        .option('expires-in', { describe: 'Days until expiry', type: 'number' })
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .example('$0 keys:create --name "CI Key"', 'Create a read-write API key'),
    createKey as never
  )
  .command(
    'keys:delete <keyId>',
    'Delete an API key',
    (y: Argv) =>
      y
        .positional('keyId', { describe: 'API key UUID', type: 'string' })
        .option('yes', { alias: 'y', describe: 'Confirm deletion', type: 'boolean', default: false })
        .example('$0 keys:delete abc123-... --yes', 'Revoke an API key'),
    deleteKey as never
  )
  .command(
    'analytics:post <postId>',
    'Get metrics for a published post',
    (y: Argv) =>
      y
        .positional('postId', { describe: 'Published post UUID', type: 'string' })
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .example('$0 analytics:post abc123-...', 'Get post analytics'),
    analyticsPost as never
  )
  .command(
    'analytics:best-time',
    'Get best time to publish for an account',
    (y: Argv) =>
      y
        .option('account-id', {
          alias: 'a',
          describe: 'Channel UUID from accounts:list',
          type: 'string',
          demandOption: true,
        })
        .option('profile-id', { describe: 'Profile (project) UUID', type: 'string' })
        .option('post-type', { describe: 'Post type context', type: 'string', default: 'post' })
        .option('top', { describe: 'Number of slots to show', type: 'number', default: 5 })
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .example('$0 analytics:best-time -a <channel-uuid>', 'Best time recommendations'),
    analyticsBestTime as never
  )
  .command(
    'posts:list',
    'List posts in a date range',
    (y: Argv) =>
      y
        .option('from', {
          describe: 'Start date (YYYY-MM-DD)',
          type: 'string',
          demandOption: true,
        })
        .option('to', {
          describe: 'End date (YYYY-MM-DD)',
          type: 'string',
          demandOption: true,
        })
        .option('status', {
          describe: 'Filter by status (SCHEDULED, PUBLISHED, FAILED, etc.)',
          type: 'string',
        })
        .option('platform', {
          describe: 'Filter by platform',
          type: 'string',
        })
        .option('profile-id', {
          describe: 'Profile (project) UUID',
          type: 'string',
        })
        .option('channel-id', {
          describe: 'Filter by channel/account UUID',
          type: 'string',
        })
        .option('json', {
          describe: 'Output raw JSON',
          type: 'boolean',
          default: false,
        })
        .example(
          '$0 posts:list --from 2026-07-01 --to 2026-07-31',
          'List posts for July 2026'
        )
        .example(
          '$0 posts:list --from 2026-07-01 --to 2026-07-31 --status SCHEDULED',
          'List scheduled posts only'
        ),
    listPosts as never
  )
  .command(
    'posts:get <postId>',
    'Get a single post by ID',
    (y: Argv) =>
      y
        .positional('postId', {
          describe: 'Post UUID',
          type: 'string',
        })
        .option('profile-id', {
          describe: 'Profile (project) UUID',
          type: 'string',
        })
        .option('json', {
          describe: 'Output raw JSON',
          type: 'boolean',
          default: false,
        })
        .example('$0 posts:get abc123-...', 'Get post details'),
    getPost as never
  )
  .command(
    'posts:update <postId>',
    'Edit a scheduled/queued post',
    (y: Argv) =>
      y
        .positional('postId', {
          describe: 'Post UUID',
          type: 'string',
        })
        .option('content', {
          alias: 'c',
          describe: 'Post text/caption',
          type: 'string',
        })
        .option('accounts', {
          alias: 'i',
          describe: 'Single channel ID (from accounts:list)',
          type: 'string',
        })
        .option('date', {
          alias: 'd',
          describe: 'Publish datetime in ISO 8601 (UTC)',
          type: 'string',
        })
        .option('type', {
          alias: 't',
          describe: 'Action type',
          type: 'string',
          choices: ['schedule', 'draft', 'publish'],
          default: 'schedule',
        })
        .option('timezone', {
          describe: 'IANA timezone for schedule',
          type: 'string',
          default: 'UTC',
        })
        .option('post-type', {
          describe: 'Post format (post, reel, story, video, thread, pin, offer, event)',
          type: 'string',
          default: 'post',
        })
        .option('profile-id', {
          describe: 'Profile (project) UUID',
          type: 'string',
        })
        .option('json', {
          alias: 'j',
          describe: 'Path to JSON file with full EditPostRequest payload',
          type: 'string',
        })
        .option('settings', {
          describe: 'Platform-specific settings as JSON string',
          type: 'string',
        })
        .check((argv) => {
          if (!argv.json && !argv.content) {
            throw new Error('Either --content (-c) or --json is required');
          }
          if (!argv.json && !argv.accounts) {
            throw new Error('--accounts (-i) is required when not using --json');
          }
          return true;
        })
        .example('$0 posts:update <id> -c "Updated text" -i "channel-uuid" -d "2026-07-10T09:00:00.000Z"', 'Update a post'),
    updatePost as never
  )
  .command(
    'posts:retry <postId>',
    'Retry a failed post',
    (y: Argv) =>
      y
        .positional('postId', { describe: 'Post UUID', type: 'string' })
        .option('profile-id', { describe: 'Profile (project) UUID', type: 'string' })
        .example('$0 posts:retry abc123-...', 'Retry publishing a failed post'),
    retryPost as never
  )
  .command(
    'posts:create',
    'Create, schedule, or publish a post',
    (y: Argv) =>
      y
        .option('content', {
          alias: 'c',
          describe: 'Post text/caption',
          type: 'string',
        })
        .option('accounts', {
          alias: 'i',
          describe: 'Comma-separated channel IDs from accounts:list',
          type: 'string',
        })
        .option('date', {
          alias: 'd',
          describe: 'Publish datetime in ISO 8601 (UTC)',
          type: 'string',
        })
        .option('type', {
          alias: 't',
          describe: 'Action type',
          type: 'string',
          choices: ['schedule', 'draft', 'publish'],
          default: 'schedule',
        })
        .option('timezone', {
          describe: 'IANA timezone for schedule',
          type: 'string',
          default: 'UTC',
        })
        .option('post-type', {
          describe: 'Post format (post, reel, story, video, thread, pin, offer, event)',
          type: 'string',
          default: 'post',
        })
        .option('profile-id', {
          describe: 'Profile (project) UUID',
          type: 'string',
        })
        .option('json', {
          alias: 'j',
          describe: 'Path to JSON file with full post payload',
          type: 'string',
        })
        .option('settings', {
          describe: 'Platform-specific settings as JSON string',
          type: 'string',
        })
        .check((argv) => {
          if (!argv.json && !argv.content) {
            throw new Error('Either --content (-c) or --json is required');
          }
          if (!argv.json && !argv.accounts) {
            throw new Error('--accounts (-i) is required when not using --json');
          }
          if (!argv.json && argv.type !== 'publish' && !argv.date) {
            throw new Error('--date (-d) is required for schedule and draft posts');
          }
          return true;
        })
        .example(
          '$0 posts:create -c "Hello world!" -i "channel-uuid" -d "2026-07-10T09:00:00.000Z"',
          'Schedule a post'
        )
        .example(
          '$0 posts:create -c "Going live!" -i "channel-uuid" -t publish',
          'Publish immediately'
        )
        .example(
          '$0 posts:create --json ./post.json',
          'Create from JSON file'
        ),
    createPost as never
  )
  .command(
    'posts:drafts',
    'List draft posts',
    (y: Argv) =>
      y
        .option('from', {
          describe: 'Start date (YYYY-MM-DD)',
          type: 'string',
          demandOption: true,
        })
        .option('to', {
          describe: 'End date (YYYY-MM-DD)',
          type: 'string',
          demandOption: true,
        })
        .option('profile-id', {
          describe: 'Profile (project) UUID',
          type: 'string',
        })
        .option('platform', {
          describe: 'Filter by platform',
          type: 'string',
        })
        .option('json', {
          describe: 'Output raw JSON',
          type: 'boolean',
          default: false,
        })
        .example(
          '$0 posts:drafts --from 2026-07-01 --to 2026-07-31',
          'List drafts for July 2026'
        ),
    listDraftPosts as never
  )
  .command(
    'posts:delete <postId>',
    'Delete a post',
    (y: Argv) =>
      y
        .positional('postId', {
          describe: 'Post UUID to delete',
          type: 'string',
        })
        .option('profile-id', {
          describe: 'Profile (project) UUID',
          type: 'string',
        })
        .option('yes', {
          alias: 'y',
          describe: 'Confirm deletion',
          type: 'boolean',
          default: false,
        })
        .example('$0 posts:delete abc123-...', 'Delete a post'),
    deletePost as never
  )
  .command(
    'drafts:update <draftId>',
    'Update a draft post (JSON only)',
    (y: Argv) =>
      y
        .positional('draftId', { describe: 'Draft UUID', type: 'string' })
        .option('json', {
          alias: 'j',
          describe: 'Path to JSON file with full CreatePostsRequest payload',
          type: 'string',
          demandOption: true,
        })
        .option('profile-id', { describe: 'Profile (project) UUID', type: 'string' })
        .example('$0 drafts:update abc123-... --json ./draft.json', 'Update a draft via JSON'),
    updateDraft as never
  )
  .command(
    'drafts:delete <draftId>',
    'Delete a draft post',
    (y: Argv) =>
      y
        .positional('draftId', { describe: 'Draft UUID to delete', type: 'string' })
        .option('profile-id', { describe: 'Profile (project) UUID', type: 'string' })
        .option('yes', { alias: 'y', describe: 'Confirm deletion', type: 'boolean', default: false })
        .example('$0 drafts:delete abc123-... --yes', 'Delete a draft'),
    deleteDraft as never
  )
  .command(
    'validate',
    'Validate post text character limits',
    (y: Argv) =>
      y
        .option('text', { alias: 't', describe: 'Post text to validate', type: 'string', demandOption: true })
        .option('strict', { describe: 'Exit 1 if any platform invalid', type: 'boolean', default: false })
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .example('$0 validate -t "hello https://verlynk.com"', 'Validate character limits'),
    validate as never
  )
  .command(
    'usage',
    'Show plan and usage stats',
    (y: Argv) =>
      y
        .option('json', { describe: 'Output raw JSON', type: 'boolean', default: false })
        .example('$0 usage', 'Show plan and channel usage'),
    usage as never
  )
  .demandCommand(1, 'You need at least one command')
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .epilogue(
    'Documentation: https://docs.verlynk.com\n\n' +
      'Authentication:\n' +
      '  verlynk auth:login --key <your-api-key>\n' +
      '  export VERLYNK_API_KEY=your_api_key\n\n' +
      'Profiles:  profiles:list|get|use|create|update|delete\n' +
      'Accounts:  accounts:list|disconnect\n' +
      'Keys:      keys:list|create|delete\n' +
      'Analytics: analytics:post|best-time'
  )
  .parse();
