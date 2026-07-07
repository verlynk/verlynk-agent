# Examples

Workflow examples for Verlynk MCP tools.

Replace placeholder values:
- `YOUR_CHANNEL_ID` — from `list-channels`
- `YOUR_MCP_KEY` — MCP token with `mcp:access` scope
- `YOUR_API_KEY` — Public API key with `posts:write` (media upload only)

---

## Basic discovery workflow

### 1. List channels

**Agent prompt:**

```
List all my connected Verlynk channels
```

**MCP tool:** `list-channels` with `{}`

**Use the response:** `structuredContent.channels[].channelId` → `channelId`, `.platformName` → platform.

### 2. List scheduled posts

**Agent prompt:**

```
Show all my Verlynk posts scheduled between July 1 and July 31, 2026
```

**MCP tool:** `get-posts`

```json
{
  "from": "2026-07-01",
  "to": "2026-07-31",
  "status": "SCHEDULED",
  "view": "list"
}
```

### 3. Create a draft text post

**Agent prompt:**

```
Create a draft LinkedIn post in Verlynk:
"We just shipped our analytics dashboard. Check it out!"
```

**MCP tool:** `create-posts` — see [`create-text-post.json`](./create-text-post.json)

---

## Scheduled post

**Agent prompt:**

```
Schedule this on my LinkedIn channel for tomorrow at 9:00 AM IST:
"Monday motivation — ship early, iterate often."
```

**MCP tool:** `create-posts` — see [`create-scheduled-post.json`](./create-scheduled-post.json)

Key fields:
- `action`: `"SCHEDULE"`
- `schedule.type`: `"ONCE"`
- `schedule.details.utc`: ISO 8601 datetime in UTC
- `schedule.details.timezone`: IANA timezone (e.g. `Asia/Kolkata`)

---

## Multi-platform campaign

Post the same campaign to LinkedIn and X at the same time.

**Agent prompt:**

```
Schedule the same announcement on my LinkedIn and X channels for July 8 at 2pm UTC
```

**MCP tool:** `create-posts` with multiple items in `posts[]` — see [`create-multi-platform.json`](./create-multi-platform.json)

---

## Image post with media upload

MCP does not upload files. Use Public API presign first.

### Step 1: Upload image

```bash
export VERLYNK_API_KEY="your_api_key_with_posts_write"
export VERLYNK_PROFILE_ID="your-profile-uuid"  # if multi-profile org

chmod +x examples/upload-media.sh
./examples/upload-media.sh ./hero-image.jpg "$VERLYNK_PROFILE_ID"
```

Copy `publicUrl` from the output.

### Step 2: Create post with media

**Agent prompt:**

```
Schedule an Instagram post with this image for tomorrow noon UTC.
Caption: "New hero image for our landing page!"
Media URL: https://cdn.verlynk.com/temp/.../hero-image.jpg
```

**MCP tool:** `create-posts`

```json
{
  "action": "SCHEDULE",
  "posts": [
    {
      "channelId": "YOUR_INSTAGRAM_CHANNEL_ID",
      "postType": "post",
      "metaData": {
        "contents": [
          {
            "title": "",
            "text": "New hero image for our landing page!",
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
          "utc": "2026-07-09T12:00:00.000Z"
        }
      }
    }
  ]
}
```

See [MEDIA.md](../MEDIA.md) for full upload details.

---

## YouTube video post

1. Upload video via [`upload-media.sh`](./upload-media.sh)
2. Use `publicUrl` in [`create-youtube-post.json`](./create-youtube-post.json)

**Agent prompt:**

```
Schedule a YouTube video titled "Product Demo — Q3 Features" for July 10 at 6pm UTC.
Use this media URL: https://cdn.verlynk.com/temp/.../demo.mp4
```

---

## TikTok video post

TikTok requires trusted media URLs. Always upload via presign first.

See [`create-tiktok-post.json`](./create-tiktok-post.json) and [PROVIDER_SETTINGS.md](../PROVIDER_SETTINGS.md#tiktok).

---

## Publish immediately

**Agent prompt:**

```
Publish this post to my X channel right now: "We are live! 🚀"
```

```json
{
  "action": "PUBLISH",
  "posts": [
    {
      "channelId": "YOUR_X_CHANNEL_ID",
      "postType": "post",
      "metaData": {
        "contents": [
          {
            "title": "",
            "text": "We are live! 🚀",
            "media": []
          }
        ],
        "replySettings": "everyone"
      },
      "schedule": {
        "type": "NOW",
        "details": {
          "timezone": "UTC"
        }
      }
    }
  ]
}
```

---

## Filter posts by platform

**Agent prompt:**

```
Show all failed Instagram posts from the last 7 days in Verlynk
```

```json
{
  "from": "2026-07-01",
  "to": "2026-07-08",
  "status": "FAILED",
  "platform": "instagram",
  "view": "list"
}
```

---

## Example JSON files

| File | Description |
| --- | --- |
| [`create-text-post.json`](./create-text-post.json) | Draft text post |
| [`create-scheduled-post.json`](./create-scheduled-post.json) | Scheduled single post |
| [`create-multi-platform.json`](./create-multi-platform.json) | LinkedIn + X campaign |
| [`create-youtube-post.json`](./create-youtube-post.json) | YouTube video with tags |
| [`create-tiktok-post.json`](./create-tiktok-post.json) | TikTok video post |
| [`upload-media.sh`](./upload-media.sh) | Media presign upload script |

---

## Related

- [MCP_TOOLS.md](../MCP_TOOLS.md)
- [PROVIDER_SETTINGS.md](../PROVIDER_SETTINGS.md)
- [MEDIA.md](../MEDIA.md)
- [skills/verlynk/SKILL.md](../skills/verlynk/SKILL.md)
