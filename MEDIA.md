# Media Upload

There are **two different media shapes**. Mixing them causes API validation errors.

| Path | Auth | Local files | Media object in post |
| --- | --- | --- | --- |
| **CLI / Public API** | `VERLYNK_API_KEY` (`posts:write`) | `verlynk media:upload` or presign → PUT → complete | `{ "mediaId", "fileType", "contentType" }` |
| **MCP `create-posts`** | MCP key (`mcp:access`) | Upload via CLI/API first, then pass CDN URL | `{ "mediaUrl", "mimeType" }` |

**Never** put `mediaUrl` / `mimeType` in CLI `--json`. **Never** put `mediaId` / `fileType` in MCP `create-posts`.

---

## Preferred: CLI (local files)

```bash
# Upload
verlynk media:upload ~/Pictures/quote.png --json
# → mediaId, publicUrl, fileType, contentType

# Schedule with image in one step
verlynk posts:create --media-file ~/Pictures/quote.png \
  -c "Caption here" \
  -i "<channel-id>" \
  -d "2026-07-16T05:30:00.000Z" \
  --timezone Asia/Calcutta \
  --profile-id "<profile-that-owns-channel>"
```

Text-only (no media):

```bash
verlynk posts:create -c "Caption" -i "<channel-id>" -d "2026-07-16T05:30:00.000Z" --timezone Asia/Calcutta
```

Use the **profileId that owns the channel** (`accounts:list` → `profileId._id`). Wrong profile → clear `ChannelNotInProfile` error.

---

## Public API / CLI JSON shape

After `media:upload` (or manual presign → PUT → complete):

```json
{
  "action": "SCHEDULE",
  "posts": [
    {
      "channelId": "YOUR_CHANNEL_ID",
      "postType": "post",
      "metaData": {
        "contents": [
          {
            "text": "Check out our new hero image!",
            "media": [
              {
                "mediaId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                "fileType": "image",
                "contentType": "image/jpeg"
              }
            ]
          }
        ]
      },
      "schedule": {
        "type": "ONCE",
        "details": {
          "timezone": "Asia/Calcutta",
          "utc": "2026-07-16T05:30:00.000Z"
        }
      }
    }
  ]
}
```

```bash
verlynk posts:create --json ./create-image-post-cli.json --profile-id YOUR_PROFILE_ID
```

### Presign → complete (curl)

```bash
# 1. Presign (returns mediaId)
curl -s -X POST "https://verlynk.com/api/v1/media/presign?profileId=YOUR_PROFILE_ID" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"filename":"hero-image.jpg","contentType":"image/jpeg","size":2048576}'

# Response includes: uploadUrl, publicUrl, key, type, mediaId

# 2. PUT file
curl -X PUT "$UPLOAD_URL" -H "Content-Type: image/jpeg" --data-binary @hero-image.jpg

# 3. Complete (marks media ready for posts)
curl -s -X POST "https://verlynk.com/api/v1/media/$MEDIA_ID/complete" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Field mapping

| Presign / complete | CLI / Public API post media |
| --- | --- |
| `mediaId` | `mediaId` (required) |
| `publicUrl` | optional `url` (server overwrites from DB) |
| `key` | optional `objectKey` |
| `type: image` | `fileType: image` |
| `type: video` | `fileType: video` |
| `type: document` | `fileType: application` |
| MIME from request | `contentType` (use `image/jpeg` not `image/jpg` on posts) |

---

## MCP `create-posts` shape

MCP media items use **only**:

```json
{ "mediaUrl": "https://cdn.verlynk.com/temp/.../hero-image.jpg", "mimeType": "image/jpeg" }
```

1. Upload with CLI/`presign`+`complete` (or use a public HTTPS URL / Google Drive link).
2. Pass `publicUrl` as `mediaUrl`.
3. Optional `profileId` on the tool call when the channel is not on the default profile.

```json
{
  "action": "SCHEDULE",
  "profileId": "OPTIONAL_NON_DEFAULT_PROFILE",
  "posts": [
    {
      "channelId": "YOUR_CHANNEL_ID",
      "postType": "post",
      "metaData": {
        "contents": [
          {
            "title": "",
            "text": "Check out our new hero image!",
            "media": [
              {
                "mediaUrl": "https://cdn.verlynk.com/temp/.../hero-image.jpg",
                "mimeType": "image/jpeg"
              }
            ]
          }
        ]
      },
      "schedule": {
        "type": "ONCE",
        "details": { "timezone": "UTC", "utc": "2026-07-08T12:00:00.000Z" }
      }
    }
  ]
}
```

---

## Authentication

| Key | Scope | Used for |
| --- | --- | --- |
| MCP key | `mcp:access` | MCP tools |
| Public API key | `posts:write` | Media presign, complete, CLI posts |

Create keys in **Settings → Developer**. Presign needs a valid billing plan.

## Supported content types

| Category | MIME types |
| --- | --- |
| Images | `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif` |
| Videos | `video/mp4`, `video/mpeg`, `video/quicktime`, `video/avi`, `video/x-msvideo`, `video/webm`, `video/x-m4v` |
| Documents | `application/pdf` |

Max size **5 GB**. Presigned `uploadUrl` expires in **1 hour**.

## Shell script

[`examples/upload-media.sh`](./examples/upload-media.sh) — presign → PUT → complete; prints `mediaId` and `publicUrl`.

## Errors

| HTTP | errorCode | Meaning |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | Invalid API key |
| 403 | `API_KEY_SCOPE_DENIED` | Key lacks `posts:write` |
| 400 | `MEDIA_PRESIGN_PROFILE_REQUIRED` | Pass `profileId` when org has multiple profiles |
| 400 | `MEDIA_COMPLETE_NOT_UPLOADED` | PUT the file before complete |
| 400 | — | Missing filename/contentType, unsupported MIME, incomplete media on create |
| 404 | `PROFILE_NOT_FOUND` / `MEDIA_NOT_FOUND` | Invalid profile or mediaId |
| 429 | — | Rate limit exceeded |

## Related

- [cli/README.md](./cli/README.md) — CLI commands
- [MCP_TOOLS.md](./MCP_TOOLS.md) — `create-posts` reference
- [examples/EXAMPLES.md](./examples/EXAMPLES.md)
- [docs.verlynk.com/api-reference](https://docs.verlynk.com/api-reference) — OpenAPI
