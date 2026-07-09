import { getAPI } from '../config.js';
import { fail, printJson } from '../cli.js';

function printField(label: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  console.log(`${label.padEnd(16)} ${String(value)}`);
}

export async function usage(argv: { json?: boolean }) {
  const api = getAPI();
  try {
    const stats = await api.getUsageStats();
    if (argv.json) {
      printJson(stats);
      return;
    }

    printField('Plan', stats.planName);
    printField('Status', stats.planStatus);
    printField('Channels', `${stats.currentChannels}/${stats.maxChannels}`);
    printField('Billing', stats.billingPeriod);
    printField('Provider', stats.paymentProvider);
    printField('Next bill', stats.nextBillingDate);
    printField('Trial ends', stats.trialExpiresAt);
    printField('Billed on', stats.billedOn);
    printField('Start', stats.currentStartDate);
    printField('End', stats.currentEndDate);
    printField('Cancelled', stats.canceledAt);
  } catch (err: unknown) {
    fail(err);
  }
}

