import { readFileSync } from 'fs';
import { getAPI, resolveProfileId } from '../config.js';
import { fail, requireYes } from '../cli.js';
import type { CreatePostsData } from '../api.js';

export async function updateDraft(argv: { draftId: string; json: string; 'profile-id'?: string }) {
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  let body: CreatePostsData;
  try {
    body = JSON.parse(readFileSync(argv.json, 'utf-8')) as CreatePostsData;
  } catch (err: unknown) {
    console.error(`Error reading JSON file: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  try {
    const res = await api.updateDraftPost(argv.draftId, body, profileId);
    console.log(res.message || 'Draft update accepted for processing.');
  } catch (err: unknown) {
    fail(err);
  }
}

export async function deleteDraft(argv: { draftId: string; 'profile-id'?: string; yes?: boolean }) {
  requireYes(argv, `delete draft ${argv.draftId}`);
  const api = getAPI();
  const profileId = await resolveProfileId(argv['profile-id']);

  try {
    await api.deleteDraftPost(argv.draftId, profileId);
    console.log(`Draft ${argv.draftId} deleted successfully.`);
  } catch (err: unknown) {
    fail(err);
  }
}

