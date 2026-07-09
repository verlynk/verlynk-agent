import { getAPI, resolveProfileId } from '../config.js';
import { fail, printJson, truncate } from '../cli.js';
import type { BestTimeLine, PostMetricsResponse } from '../api.js';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function printMetricsTable(metrics: PostMetricsResponse) {
  const entries = Object.entries(metrics).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) {
    console.log('No metrics available for this post.');
    return;
  }

  const COL = { metric: 20, value: 12 };
  const header = 'Metric'.padEnd(COL.metric) + 'Value';
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const [name, value] of entries) {
    const row =
      truncate(name, COL.metric - 2).padEnd(COL.metric) + String(value.metric ?? 0);
    console.log(row);
  }
}

export async function analyticsPost(argv: { postId: string; json?: boolean }) {
  const api = getAPI();
  try {
    const metrics = await api.getPostMetrics(argv.postId);
    if (argv.json) {
      printJson(metrics);
      return;
    }
    printMetricsTable(metrics);
  } catch (err: unknown) {
    fail(err);
  }
}

export async function analyticsBestTime(argv: {
  'account-id': string;
  'profile-id'?: string;
  'post-type'?: string;
  top?: number;
  json?: boolean;
}) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);
  const top = argv.top ?? 5;

  try {
    const lines = await api.getAnalyticsBestTime({
      accountId: argv['account-id'],
      profileId,
      postType: argv['post-type'] || 'post',
    });

    if (argv.json) {
      printJson(lines);
      return;
    }

    const windowLine = lines.find((l): l is Extract<BestTimeLine, { type: 'window' }> => l.type === 'window');
    const narrativeLine = lines.find(
      (l): l is Extract<BestTimeLine, { type: 'narrative' }> => l.type === 'narrative'
    );

    if (!windowLine) {
      console.log('No best-time recommendations returned.');
      if (narrativeLine) console.log(`Recommendation: ${narrativeLine.text}`);
      return;
    }

    const { payload } = windowLine;
    console.log(`Timezone:    ${payload.timezone}`);
    console.log(`Data source: ${payload.dataSource}`);
    console.log(`Confidence:  ${payload.confidenceLevel}`);
    console.log(`Data points: ${payload.dataPoints}`);
    console.log('');

    const slots = [...payload.slots].sort((a, b) => b.score - a.score).slice(0, top);
    const COL = { rank: 6, day: 6, hour: 6, score: 8, engagement: 16, posts: 10 };
    const header =
      'Rank'.padEnd(COL.rank) +
      'Day'.padEnd(COL.day) +
      'Hour'.padEnd(COL.hour) +
      'Score'.padEnd(COL.score) +
      'AvgEngagement'.padEnd(COL.engagement) +
      'PostCount';

    console.log(header);
    console.log('-'.repeat(header.length));

    slots.forEach((slot, i) => {
      const row =
        String(i + 1).padEnd(COL.rank) +
        (DAY_NAMES[slot.day] || String(slot.day)).padEnd(COL.day) +
        String(slot.hour).padEnd(COL.hour) +
        slot.score.toFixed(2).padEnd(COL.score) +
        slot.avgEngagement.toFixed(2).padEnd(COL.engagement) +
        String(slot.postCount);
      console.log(row);
    });

    if (narrativeLine) {
      console.log('');
      console.log(`Recommendation: ${narrativeLine.text}`);
    }
  } catch (err: unknown) {
    fail(err);
  }
}
