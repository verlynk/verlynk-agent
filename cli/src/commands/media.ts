import { readFileSync, statSync } from 'fs';
import { basename, extname } from 'path';
import type { MediaCompleteResponse, PostMediaItem } from '../api.js';
import { fail, printJson } from '../cli.js';
import { getAPI, resolveProfileId } from '../config.js';

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.m4v': 'video/x-m4v',
  '.avi': 'video/x-msvideo',
  '.pdf': 'application/pdf',
};

/** Map presign `type` (image|video|document) → Public API fileType. */
export function fileCategoryToFileType(
  type: 'image' | 'video' | 'document',
): 'image' | 'video' | 'application' {
  if (type === 'document') return 'application';
  return type;
}

export function inferContentType(filePath: string, explicit?: string): string {
  if (explicit) return explicit.toLowerCase().trim();
  const ext = extname(filePath).toLowerCase();
  const mime = EXT_TO_MIME[ext];
  if (!mime) {
    console.error(
      `Error: Could not infer content type for "${ext || filePath}". Pass --content-type (e.g. image/png).`,
    );
    process.exit(1);
  }
  return mime;
}

/**
 * Presign → PUT → complete. Returns completed media ready for posts:create.
 */
export async function uploadMediaFile(
  filePath: string,
  opts: { contentType?: string; profileId?: string },
): Promise<MediaCompleteResponse & { contentType: string; fileType: string }> {
  const api = getAPI();
  const profileId = await resolveProfileId(opts.profileId);
  const contentType = inferContentType(filePath, opts.contentType);
  const filename = basename(filePath);
  let size: number;
  let bytes: Buffer;
  try {
    size = statSync(filePath).size;
    bytes = readFileSync(filePath);
  } catch (err: unknown) {
    fail(err);
  }

  try {
    const presign = await api.presignMedia(
      { filename, contentType, size },
      profileId,
    );
    await api.putPresignedUpload(presign.uploadUrl, bytes, contentType);
    const completed = await api.completeMedia(presign.mediaId);
    return {
      ...completed,
      contentType,
      fileType: fileCategoryToFileType(completed.type),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('API_KEY_SCOPE_DENIED')) {
      console.error(
        'Hint: Media upload requires a Public API key with posts:write scope (Settings → Developer).',
      );
    }
    fail(err);
  }
}

export function toPostMediaItem(
  uploaded: MediaCompleteResponse & { contentType: string; fileType: string },
): PostMediaItem {
  return {
    mediaId: uploaded.mediaId,
    fileType: uploaded.fileType,
    contentType: uploaded.contentType,
    url: uploaded.publicUrl,
    objectKey: uploaded.key,
  };
}

export async function uploadMedia(argv: {
  file: string;
  'content-type'?: string;
  'profile-id'?: string;
  json?: boolean;
}) {
  const uploaded = await uploadMediaFile(argv.file, {
    contentType: argv['content-type'],
    profileId: argv['profile-id'],
  });

  if (argv.json) {
    printJson({
      mediaId: uploaded.mediaId,
      publicUrl: uploaded.publicUrl,
      key: uploaded.key,
      type: uploaded.type,
      fileType: uploaded.fileType,
      contentType: uploaded.contentType,
      status: uploaded.status,
    });
    return;
  }

  console.log(`mediaId:    ${uploaded.mediaId}`);
  console.log(`publicUrl:  ${uploaded.publicUrl}`);
  console.log(`key:        ${uploaded.key}`);
  console.log(`type:       ${uploaded.type}`);
  console.log(`fileType:   ${uploaded.fileType}`);
  console.log(`contentType: ${uploaded.contentType}`);
  console.log(`status:     ${uploaded.status}`);
  console.log('');
  console.log(
    'Use mediaId in posts:create --json or --media-id / --media-file.',
  );
}
