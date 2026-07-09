import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { Argv } from 'yargs';
import { authLogin, authLogout, authStatus } from './commands/auth.js';
import { listAccounts } from './commands/accounts.js';
import {
  listPosts,
  getPost,
  createPost,
  listDraftPosts,
  deletePost,
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
        .example('$0 posts:delete abc123-...', 'Delete a post'),
    deletePost as never
  )
  .demandCommand(1, 'You need at least one command')
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .epilogue(
    'Documentation: https://docs.verlynk.com\n\nAuthentication:\n  verlynk auth:login --key <your-api-key>\n  export VERLYNK_API_KEY=your_api_key'
  )
  .parse();
