# Examples

Workflow examples for Verlynk MCP tools.

Replace placeholder values:
- `YOUR_CHANNEL_ID` — from `list-channels`
- `YOUR_MCP_KEY` — MCP token with `mcp:access` scope
- `YOUR_API_KEY` — Public API key with `posts:write` (media upload only)

---

## Basic discovery workflow

### 0. List profiles (multi-project)

**Agent prompt:**

```
There is another project in my Verlynk account — list channels from that one
```

**MCP tools:**

1. `list-profiles` with `{}`
2. Pick the non-default (or match by `name`) → use `id` as `profileId`
3. `list-channels` with `{ "profileId": "<uuid>" }`

### 1. List channels

**Agent prompt:**

```
List all my connected Verlynk channels
```

**MCP tool:** `list-channels` with `{}`

**Use the response:** `structuredContent.channels[].channelId` → `channelId`, `.platformName` → platform. Also note `structuredContent.profileId` / `profileName`.

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

> **Note:** Drafts are saved but **not returned** by `get-posts`. Verify drafts in the Verlynk dashboard.

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

**Prefer CLI for local files** (Claude Code):

```bash
verlynk media:upload ./hero-image.jpg --json
verlynk posts:create --media-file ./hero-image.jpg \
  -c "New hero image for our landing page!" \
  -i "YOUR_CHANNEL_ID" \
  -d "2026-07-09T12:00:00.000Z" \
  --profile-id "YOUR_PROFILE_ID"
```

CLI JSON shape (Public API — uses `mediaId`, **not** `mediaUrl`): [`create-image-post-cli.json`](./create-image-post-cli.json)

---

### MCP path (URL-based media)

MCP does not upload files. Upload first, then pass `publicUrl` as `mediaUrl`.

#### Step 1: Upload image

```bash
export VERLYNK_API_KEY="your_api_key_with_posts_write"
export VERLYNK_PROFILE_ID="your-profile-uuid"

# Preferred
verlynk media:upload ./hero-image.jpg --json

# Or shell script (prints mediaId + publicUrl after complete)
chmod +x examples/upload-media.sh
./examples/upload-media.sh ./hero-image.jpg "$VERLYNK_PROFILE_ID"
```

#### Step 2: MCP create-posts

**Agent prompt:**

```
Schedule an Instagram post with this image for tomorrow noon UTC.
Caption: "New hero image for our landing page!"
Media URL: https://cdn.verlynk.com/temp/.../hero-image.jpg
```

**MCP tool:** `create-posts` — media shape is MCP-only `{ mediaUrl, mimeType }`:

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

See [MEDIA.md](../MEDIA.md) — do not mix MCP and CLI media field names.

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
Publish this post to my X channel right now: "We are live!"
```

See [`create-publish-now-post.json`](./create-publish-now-post.json) (`action: PUBLISH` + `schedule.type: NOW`).

> **Pairing:** `action: SCHEDULE` only accepts `ONCE` / `RECURRING_*`. Using `SCHEDULE` + `NOW` is rejected with **400**. Prefer `PUBLISH` + `NOW`.

---

## Queue post (paid / queue enabled)

Channel queue must be enabled. Use `queueType` `NEXT` (front) or `LAST` (back).

```bash
verlynk posts:create --json ./examples/create-queue-post.json
```

See [`create-queue-post.json`](./create-queue-post.json). Free plans reject `QUEUE` (`post.ScheduleFeature`).

---

## Recurring schedules (paid)

```bash
verlynk posts:create --json ./examples/create-recurring-weekly-post.json
verlynk posts:create --json ./examples/create-recurring-monthly-post.json
verlynk posts:create --json ./examples/create-recurring-custom-post.json
```

| Type | Limits |
| --- | --- |
| `RECURRING_WEEKLY` | Span ≤ 3 months; `daysOfWeek` like `"Monday"` |
| `RECURRING_MONTHLY` | Span ≤ 12 months; `dayOfMonth` 1–31 |
| `RECURRING_CUSTOM` | 1–25 future UTC dates |

---

## Needs approval

Requires top-level `workflowId` on MCP `create-posts` or CLI `--json`:

```bash
verlynk posts:create --json ./examples/create-needs-approval-post.json
```

Schedule types for approval: `ONCE`, `QUEUE`, `RECURRING_*` (not `NOW` / `DRAFT`).

---

## Update a scheduled post

Edit body uses singular `post` (not `posts[]`):

```bash
verlynk posts:update <post-id> --json ./examples/update-scheduled-post.json
```

See [`update-scheduled-post.json`](./update-scheduled-post.json).

Editable statuses: `SCHEDULED`, `QUEUED`, `NEEDS_APPROVAL`, and limited `PUBLISHED` (Facebook/LinkedIn/YouTube/Mastodon text). `FAILED` → use `posts:retry`. `PROCESSING` → cannot edit.

---

## Promote a draft to schedule

```bash
verlynk drafts:update <draft-id> --json ./examples/update-draft-to-schedule.json
```

Returns **202** immediately (async). Poll `posts:list` / `posts:drafts` to verify. See [`update-draft-to-schedule.json`](./update-draft-to-schedule.json).

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
| [`create-scheduled-post.json`](./create-scheduled-post.json) | Schedule once (`ONCE`) |
| [`create-publish-now-post.json`](./create-publish-now-post.json) | Publish now |
| [`create-queue-post.json`](./create-queue-post.json) | Queue (`NEXT` / change to `LAST`) |
| [`create-recurring-weekly-post.json`](./create-recurring-weekly-post.json) | Weekly recurring |
| [`create-recurring-monthly-post.json`](./create-recurring-monthly-post.json) | Monthly recurring |
| [`create-recurring-custom-post.json`](./create-recurring-custom-post.json) | Custom date list |
| [`create-needs-approval-post.json`](./create-needs-approval-post.json) | Approval workflow (CLI/Public; needs `workflowId`) |
| [`update-scheduled-post.json`](./update-scheduled-post.json) | Edit scheduled post (`post` singular) |
| [`update-draft-to-schedule.json`](./update-draft-to-schedule.json) | Draft → schedule transition |
| [`create-multi-platform.json`](./create-multi-platform.json) | LinkedIn + X campaign |
| [`create-image-post-cli.json`](./create-image-post-cli.json) | CLI/Public media shape |
| [`create-youtube-post.json`](./create-youtube-post.json) | YouTube video with tags |
| [`create-tiktok-post.json`](./create-tiktok-post.json) | TikTok video post |
| [`upload-media.sh`](./upload-media.sh) | Media presign upload script |

---

## Related

- [MCP_TOOLS.md](../MCP_TOOLS.md)
- [PROVIDER_SETTINGS.md](../PROVIDER_SETTINGS.md)
- [MEDIA.md](../MEDIA.md)
- [skills/verlynk/SKILL.md](../skills/verlynk/SKILL.md)
