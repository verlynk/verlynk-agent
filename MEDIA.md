# Media Upload

The MCP `create-posts` tool accepts `mediaUrl` in post content but does **not** include an upload tool. Use the **Public API v1 presign endpoint** to upload local files.

## When you need this

- Posting images or videos from local files
- TikTok, Instagram, and YouTube (require trusted/verified URLs)
- Any post where `metaData.contents[].media[]` needs a `mediaUrl`

## Authentication

Media presign requires a **Public API key** with the `posts:write` scope — not the MCP key.

| Key | Scope | Used for |
| --- | --- | --- |
| MCP key | `mcp:access` | MCP tools |
| Public API key | `posts:write` | Media presign |

Create keys in **Settings → Developer** or via `POST /v1/api-keys`.

**Billing:** Presign requires an organization with a valid billing plan. Requests from orgs without an active plan return `400`.

If your organization has multiple profiles, pass `profileId` as a query parameter. List profiles with `GET /v1/profiles`.

## Upload workflow

### 1. Request a presigned URL

```bash
curl -s -X POST "https://verlynk.com/api/v1/media/presign?profileId=YOUR_PROFILE_ID" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "hero-image.jpg",
    "contentType": "image/jpeg",
    "size": 2048576
  }'
```

**Response:**

```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/temp/...?X-Amz-Signature=...",
  "publicUrl": "https://cdn.verlynk.com/temp/.../hero-image.jpg",
  "key": "temp/.../hero-image.jpg",
  "type": "image"
}
```

The `uploadUrl` expires after **1 hour**.

### 2. Upload the file

```bash
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @hero-image.jpg
```

Use the same `Content-Type` you sent in the presign request.

### 3. Use `publicUrl` in `create-posts`

Pass the `publicUrl` from step 1 as `mediaUrl` in your MCP `create-posts` call:

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
        "details": {
          "timezone": "UTC",
          "utc": "2026-07-08T12:00:00.000Z"
        }
      }
    }
  ]
}
```

## Supported content types

Allowed MIME types (from Verlynk Public API):

| Category | MIME types |
| --- | --- |
| Images | `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif` |
| Videos | `video/mp4`, `video/mpeg`, `video/quicktime`, `video/avi`, `video/x-msvideo`, `video/webm`, `video/x-m4v` |
| Documents | `application/pdf` |

Maximum file size: **5 GB**. Presigned `uploadUrl` expires after **1 hour** (3600 seconds).

## Shell script

A ready-to-use script is in [`examples/upload-media.sh`](./examples/upload-media.sh).

## Alternative: external URLs

`create-posts` also accepts:

- Public HTTPS URLs to media files
- Google Drive share links (converted server-side)

For TikTok, Instagram, and YouTube, prefer presigned Verlynk URLs for reliability.

## Errors

| HTTP | errorCode | Meaning |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | Invalid API key |
| 403 | `API_KEY_SCOPE_DENIED` | Key lacks `posts:write` |
| 400 | `BAD_REQUEST` | Missing filename/contentType, unsupported MIME type, or invalid billing plan |
| 404 | `PROFILE_NOT_FOUND` | Invalid `profileId` query parameter |
| 429 | — | Rate limit exceeded |

## Related

- [MCP_TOOLS.md](./MCP_TOOLS.md) — `create-posts` reference
- [examples/create-image-post workflow](./examples/EXAMPLES.md#image-post-with-media-upload)
- [docs.verlynk.com](https://docs.verlynk.com) — full OpenAPI spec
