import { getAPI, resolveProfileId } from '../config.js';
import { failJson, truncate } from '../cli.js';
import type { InboxItem, InboxByTime, InboxItemType, InboxStatus } from '../api.js';

function printInboxTable(items: InboxItem[]) {
  const COL = { id: 36, type: 8, platform: 12, status: 10, reply: 9, date: 22, text: 40 };
  const header =
    'Item ID'.padEnd(COL.id) +
    'Type'.padEnd(COL.type) +
    'Platform'.padEnd(COL.platform) +
    'Status'.padEnd(COL.status) +
    'CanReply'.padEnd(COL.reply) +
    'Created At'.padEnd(COL.date) +
    'Text';

  console.log(header);
  console.log('-'.repeat(header.length));

  for (const item of items) {
    const row =
      item.id.padEnd(COL.id) +
      item.type.padEnd(COL.type) +
      item.platform.padEnd(COL.platform) +
      item.inboxStatus.padEnd(COL.status) +
      String(item.canReply).padEnd(COL.reply) +
      item.createdAt.substring(0, COL.date - 2).padEnd(COL.date) +
      truncate(item.text, COL.text);
    console.log(row);
  }

  console.log('');
  console.log(`${items.length} item(s) listed.`);
}

export async function listInboxItems(argv: {
  from: string;
  to: string;
  platform?: string;
  'channel-id'?: string;
  status?: string;
  type?: InboxItemType;
  'by-time'?: InboxByTime;
  page?: number;
  limit?: number;
  'profile-id'?: string;
  json?: boolean;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    const response = await api.listInbox({
      from: argv.from,
      to: argv.to,
      profileId,
      platform: argv.platform,
      channelId: argv['channel-id'],
      inboxStatus: argv.status as InboxStatus | undefined,
      type: argv.type,
      byTime: argv['by-time'],
      page: argv.page,
      limit: argv.limit,
    });

    if (argv.json) {
      console.log(JSON.stringify(response, null, 2));
      return;
    }

    if (response.items.length === 0) {
      console.log('No inbox items found for the given filters.');
      return;
    }

    printInboxTable(response.items);
    console.log(
      `Page ${response.pagination.page} of ${response.pagination.totalPages} (${response.pagination.totalCount} total).`
    );
  } catch (err: unknown) {
    failJson(err, Boolean(argv.json));
  }
}

export async function replyInboxItem(argv: {
  itemId: string;
  message: string;
  'profile-id'?: string;
  json?: boolean;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    const result = await api.replyInbox(argv.itemId, { message: argv.message }, profileId);

    if (argv.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(`Reply sent to item ${result.itemId} on ${result.platform}.`);
    if (result.replyId) {
      console.log(`Reply ID: ${result.replyId}`);
    }
  } catch (err: unknown) {
    failJson(err, Boolean(argv.json));
  }
}

export async function updateInboxItemStatus(argv: {
  itemId: string;
  status: InboxStatus;
  'profile-id'?: string;
  json?: boolean;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    const result = await api.updateInboxStatus(argv.itemId, { status: argv.status }, profileId);

    if (argv.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(`Item ${result.itemId} status set to ${result.inboxStatus}.`);
  } catch (err: unknown) {
    failJson(err, Boolean(argv.json));
  }
}
