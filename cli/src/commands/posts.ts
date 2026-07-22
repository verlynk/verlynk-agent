import { readFileSync } from 'fs';
import { getAPI, resolveProfileId } from '../config.js';
import { fail, requireYes, truncate } from '../cli.js';
import type { CreatePostsData, EditPostRequest, Post, PostInput, PostMediaItem } from '../api.js';
import { toPostMediaItem, uploadMediaFile } from './media.js';

function getPostText(post: Post): string {
  const contents = post.metaData?.contents;
  if (!contents?.length) return '';
  return contents.map((c) => c.text || c.title || '').filter(Boolean).join(' | ');
}

function printPostsTable(posts: Post[]) {
  const COL = { id: 36, channel: 20, status: 14, date: 22, text: 40 };
  const header =
    'Post ID'.padEnd(COL.id) +
    'Channel'.padEnd(COL.channel) +
    'Status'.padEnd(COL.status) +
    'Publish At'.padEnd(COL.date) +
    'Text';

  console.log(header);
  console.log('-'.repeat(header.length));

  for (const post of posts) {
    const row =
      post.postId.padEnd(COL.id) +
      (post.channel?.channelName || '').substring(0, COL.channel - 2).padEnd(COL.channel) +
      (post.postStatus || '').padEnd(COL.status) +
      (post.publishAt || '').substring(0, COL.date - 2).padEnd(COL.date) +
      truncate(getPostText(post), COL.text);
    console.log(row);
  }

  console.log('');
  console.log(`${posts.length} post(s) listed.`);
}

export async function listPosts(argv: {
  from: string;
  to: string;
  status?: string;
  platform?: string;
  'profile-id'?: string;
  'channel-id'?: string;
  json?: boolean;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    const posts = await api.listPosts({
      from: argv.from,
      to: argv.to,
      profileId,
      status: argv.status,
      platform: argv.platform,
      channelId: argv['channel-id'],
    });

    if (argv.json) {
      console.log(JSON.stringify(posts, null, 2));
      return;
    }

    if (posts.length === 0) {
      console.log('No posts found for the given date range.');
      return;
    }

    printPostsTable(posts);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function getPost(argv: { postId: string; 'profile-id'?: string; json?: boolean }) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    const post = await api.getPost(argv.postId, profileId);

    if (argv.json) {
      console.log(JSON.stringify(post, null, 2));
      return;
    }

    console.log(`Post ID:     ${post.postId}`);
    console.log(`Status:      ${post.postStatus}`);
    console.log(`Type:        ${post.postType}`);
    console.log(`Publish At:  ${post.publishAt}`);
    console.log(`Channel:     ${post.channel?.channelName} (${post.channel?.platformName})`);
    console.log(`Text:        ${getPostText(post)}`);
    if (post.errorMessage) {
      console.log(`Error:       ${post.errorMessage}`);
    }
  } catch (err: unknown) {
    fail(err);
  }
}

export async function createPost(argv: {
  content?: string | string[];
  accounts?: string;
  date?: string;
  type?: 'schedule' | 'draft' | 'publish';
  timezone?: string;
  'post-type'?: string;
  'profile-id'?: string;
  json?: string;
  settings?: string;
  'media-file'?: string;
  'media-id'?: string;
  'content-type'?: string;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);
  const timezone = argv.timezone || 'UTC';

  let body: CreatePostsData;

  if (argv.json) {
    try {
      body = JSON.parse(readFileSync(argv.json, 'utf-8')) as CreatePostsData;
    } catch (err: unknown) {
      console.error(`Error reading JSON file: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  } else {
    const contents = argv.content
      ? Array.isArray(argv.content)
        ? argv.content
        : [argv.content]
      : [];

    if (contents.length === 0) {
      console.error('Error: --content (-c) or --json is required.');
      process.exit(1);
    }

    if (!argv.accounts) {
      console.error('Error: --accounts (-i) is required when not using --json.');
      process.exit(1);
    }

    const channelIds = argv.accounts.split(',').map((id) => id.trim()).filter(Boolean);
    const postType = argv['post-type'] || 'post';
    const actionType = argv.type || 'schedule';

    let action: CreatePostsData['action'];
    let scheduleType: string;
    let scheduleDetails: Record<string, unknown>;

    switch (actionType) {
      case 'publish':
        action = 'PUBLISH';
        scheduleType = 'NOW';
        scheduleDetails = { timezone };
        break;
      case 'draft':
        action = 'DRAFT';
        scheduleType = 'DRAFT';
        if (!argv.date) {
          console.error('Error: --date (-d) is required for draft posts.');
          process.exit(1);
        }
        scheduleDetails = { timezone, utc: argv.date };
        break;
      case 'schedule':
      default:
        action = 'SCHEDULE';
        scheduleType = 'ONCE';
        if (!argv.date) {
          console.error('Error: --date (-d) is required for scheduled posts.');
          process.exit(1);
        }
        scheduleDetails = { timezone, utc: argv.date };
        break;
    }

    let platformSettings: Record<string, unknown> = {};
    if (argv.settings) {
      try {
        platformSettings = JSON.parse(argv.settings) as Record<string, unknown>;
      } catch {
        console.error('Error: --settings must be valid JSON.');
        process.exit(1);
      }
    }

    const media: PostMediaItem[] = [];

    if (argv['media-file']) {
      const files = argv['media-file'].split(',').map((f) => f.trim()).filter(Boolean);
      for (const filePath of files) {
        const uploaded = await uploadMediaFile(filePath, {
          contentType: argv['content-type'],
          profileId,
        });
        media.push(toPostMediaItem(uploaded));
      }
    }

    if (argv['media-id']) {
      const ids = argv['media-id'].split(',').map((id) => id.trim()).filter(Boolean);
      for (const mediaId of ids) {
        // Caller must have completed upload; fileType/contentType required by API.
        // Prefer --media-file for local files. For media-id alone, default to image/png
        // unless --content-type is set.
        const contentType = (argv['content-type'] || 'image/png').toLowerCase();
        const fileType = contentType.startsWith('video/')
          ? 'video'
          : contentType === 'application/pdf'
            ? 'application'
            : 'image';
        media.push({ mediaId, fileType, contentType });
      }
    }

    const posts: PostInput[] = channelIds.map((channelId) => ({
      channelId,
      postType,
      metaData: {
        contents: [{ text: contents[0], media }],
        ...platformSettings,
      },
      schedule: {
        type: scheduleType,
        details: scheduleDetails,
      },
    }));

    body = { action, posts };
  }

  try {
    const result = await api.createPosts(body, profileId);
    console.log(result.message || 'Posts submitted for processing.');
    for (const post of result.posts ?? []) {
      console.log(post.url ? post.url : post.postId);
    }
    for (const draft of result.drafts ?? []) {
      console.log(
        draft.url ? `${draft.draftId}  ${draft.url}` : draft.draftId
      );
    }
  } catch (err: unknown) {
    fail(err);
  }
}

export async function listDraftPosts(argv: {
  from: string;
  to: string;
  'profile-id'?: string;
  platform?: string;
  json?: boolean;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    const drafts = await api.listDraftPosts({
      from: argv.from,
      to: argv.to,
      profileId,
      platform: argv.platform,
    });

    if (argv.json) {
      console.log(JSON.stringify(drafts, null, 2));
      return;
    }

    if (drafts.length === 0) {
      console.log('No drafts found for the given date range.');
      return;
    }

    const COL = { id: 36, channels: 30, created: 24 };
    const header = 'Draft ID'.padEnd(COL.id) + 'Channels'.padEnd(COL.channels) + 'Created At';

    console.log(header);
    console.log('-'.repeat(header.length));

    for (const draft of drafts) {
      const channelNames = draft.channels.map((c) => c.channelName || c.platformName).join(', ');
      const row =
        draft.draftId.padEnd(COL.id) +
        truncate(channelNames, COL.channels).padEnd(COL.channels) +
        draft.createdAt;
      console.log(row);
    }

    console.log('');
    console.log(`${drafts.length} draft(s) listed.`);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function deletePost(argv: { postId: string; 'profile-id'?: string; yes?: boolean }) {
  requireYes(argv, `delete post ${argv.postId}`);
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    await api.deletePost(argv.postId, profileId);
    console.log(`Post ${argv.postId} deleted successfully.`);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function retryPost(argv: { postId: string; 'profile-id'?: string }) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);
  try {
    const result = await api.retryPost(argv.postId, profileId);
    console.log(result.message || `Retry submitted for post ${argv.postId}.`);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function updatePost(argv: {
  postId: string;
  content?: string | string[];
  accounts?: string;
  date?: string;
  type?: 'schedule' | 'draft' | 'publish';
  timezone?: string;
  'post-type'?: string;
  'profile-id'?: string;
  json?: string;
  settings?: string;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);
  const timezone = argv.timezone || 'UTC';

  let body: EditPostRequest;

  if (argv.json) {
    try {
      body = JSON.parse(readFileSync(argv.json, 'utf-8')) as EditPostRequest;
    } catch (err: unknown) {
      console.error(`Error reading JSON file: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  } else {
    const contents = argv.content
      ? Array.isArray(argv.content)
        ? argv.content
        : [argv.content]
      : [];

    if (contents.length === 0) {
      console.error('Error: --content (-c) or --json is required.');
      process.exit(1);
    }

    if (!argv.accounts) {
      console.error('Error: --accounts (-i) is required when not using --json.');
      process.exit(1);
    }

    const channelId = argv.accounts.split(',').map((id) => id.trim()).filter(Boolean)[0];
    if (!channelId) {
      console.error('Error: --accounts (-i) must contain one channel id for posts:update.');
      process.exit(1);
    }

    const postType = argv['post-type'] || 'post';
    const actionType = argv.type || 'schedule';

    let action: CreatePostsData['action'];
    let scheduleType: string;
    let scheduleDetails: Record<string, unknown>;

    switch (actionType) {
      case 'publish':
        action = 'PUBLISH';
        scheduleType = 'NOW';
        scheduleDetails = { timezone };
        break;
      case 'draft':
        action = 'DRAFT';
        scheduleType = 'DRAFT';
        if (!argv.date) {
          console.error('Error: --date (-d) is required for draft posts.');
          process.exit(1);
        }
        scheduleDetails = { timezone, utc: argv.date };
        break;
      case 'schedule':
      default:
        action = 'SCHEDULE';
        scheduleType = 'ONCE';
        if (!argv.date) {
          console.error('Error: --date (-d) is required for scheduled posts.');
          process.exit(1);
        }
        scheduleDetails = { timezone, utc: argv.date };
        break;
    }

    let platformSettings: Record<string, unknown> = {};
    if (argv.settings) {
      try {
        platformSettings = JSON.parse(argv.settings) as Record<string, unknown>;
      } catch {
        console.error('Error: --settings must be valid JSON.');
        process.exit(1);
      }
    }

    const post: PostInput = {
      channelId,
      postType,
      metaData: {
        contents: [{ text: contents[0], media: [] }],
        ...platformSettings,
      },
      schedule: {
        type: scheduleType,
        details: scheduleDetails,
      },
    };

    body = { action, post };
  }

  try {
    await api.updatePost(argv.postId, body, profileId);
    console.log(`Post ${argv.postId} updated successfully.`);
  } catch (err: unknown) {
    fail(err);
  }
}
