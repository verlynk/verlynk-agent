# MCP Tools Reference

Full reference for the 3 active tools on the Verlynk MCP server.

**Server:** `https://verlynk.com/api/public/mcp`

**Auth:** `Authorization: Bearer YOUR_MCP_KEY` (scope: `mcp:access`)

---

## Context injection (`_context`)

All tools accept an optional `_context` field with `userId`, `orgId`, and `projectId`. **Do not pass this manually** — the server auto-populates it from your auth token. Agents should omit `_context` entirely.

---

## `list-channels`

Returns connected social media accounts (channels) for the authenticated user's default profile.

### Annotations

| Hint | Value |
| --- | --- |
| `readOnlyHint` | `true` |
| `destructiveHint` | `false` |
| `idempotentHint` | `true` |
| `openWorldHint` | `true` |

### Input

No required fields. Optional `_context` (auto-populated).

No JSON schema file — this tool has no user-facing input beyond auto-populated `_context`.

```json
{}
```

### Response

```json
{
  "content": [
    { "type": "text", "text": "Channels fetched successfully." },
    { "type": "text", "text": "channels: [...]" }
  ],
  "structuredContent": {
    "channels": [
      {
        "id": "channel-uuid",
        "name": "Acme Corp",
        "platform": "linkedin",
        "username": "acme-corp"
      }
    ]
  }
}
```

Channel objects include `id` (use as `channelId` in `create-posts`), `platform`, `name`, and profile metadata.

### Example prompts

- *List all my connected Verlynk channels*
- *Which LinkedIn accounts do I have connected in Verlynk?*
- *Show my X/Twitter channels*

### Errors

| Error | Cause |
| --- | --- |
| `Missing required context` | Invalid or expired auth token |
| `401 Unauthorized` | Missing or invalid MCP key |

---

## `create-posts`

Creates posts as draft, scheduled, published, queued, or pending approval.

**Always call `list-channels` first** to get valid `channelId` values.

### Annotations

| Hint | Value |
| --- | --- |
| `readOnlyHint` | `false` |
| `destructiveHint` | `false` |
| `openWorldHint` | `true` — publishes to external social platforms |

### Input

JSON schema: [`schemas/create-posts.input.json`](./schemas/create-posts.input.json)

#### Top-level fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | string | Yes | `DRAFT`, `SCHEDULE`, `PUBLISH`, `QUEUE`, or `NEEDS_APPROVAL` |
| `posts` | array | Yes | One or more post objects (see below) |

#### Post object (`posts[]`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `channelId` | string | Yes | From `list-channels` → `channels[].id` |
| `postType` | string | Yes | `post`, `reel`, `story`, `video`, `thread`, `pin`, `offer`, `event` |
| `metaData` | object | Yes | Content and platform-specific fields |
| `schedule` | object | Yes | Discriminated union by `type` (see Scheduling) |

#### `metaData` fields

| Field | Type | Description |
| --- | --- | --- |
| `contents` | array | Post content blocks (see below) |
| `firstComment` | string | Optional first comment (not for Mastodon, Bluesky, Threads, Pinterest) |
| `link` | string | Optional link attachment |

**Platform-specific fields** go inside `metaData`. See [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md).

#### `metaData.contents[]`

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Post title (YouTube, Pinterest, etc.) |
| `text` | string | Post body / caption |
| `media` | array | Media attachments |

#### `metaData.contents[].media[]`

| Field | Type | Description |
| --- | --- | --- |
| `mediaUrl` | string | Public URL to the media file |
| `mimeType` | string | e.g. `image/jpeg`, `video/mp4` |

> For local files, upload first via [MEDIA.md](./MEDIA.md) and use the returned `publicUrl` as `mediaUrl`. Google Drive share links are also supported.

### Scheduling (`schedule`)

The `schedule.type` field determines the shape of `schedule.details`:

| `schedule.type` | `details` fields |
| --- | --- |
| `NOW` | `timezone` |
| `ONCE` | `timezone`, `utc` (ISO 8601 datetime) |
| `DRAFT` | `timezone`, `utc` (ISO 8601 datetime) |
| `QUEUE` | `timezone`, `queueType` (`NEXT` or `LAST`) |
| `RECURRING_WEEKLY` | `timezone`, `daysOfWeek`, `utcStartDate`, `utcEndDate` |
| `RECURRING_MONTHLY` | `timezone`, `dayOfMonth` (1–31), `utcStartDate`, `utcEndDate` |
| `RECURRING_CUSTOM` | `timezone`, `utc` (array of ISO 8601 datetimes) |

### Response

```json
{
  "content": [
    { "type": "text", "text": "Posts submitted for processing" }
  ],
  "structuredContent": {
    "status": "accepted",
    "count": 1
  }
}
```

### Example: scheduled text post

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
            "text": "Excited to share our latest update!",
            "media": []
          }
        ]
      },
      "schedule": {
        "type": "ONCE",
        "details": {
          "timezone": "Asia/Kolkata",
          "utc": "2026-07-08T03:30:00.000Z"
        }
      }
    }
  ]
}
```

### Example prompts

- *Schedule this on my LinkedIn channel for tomorrow 9am IST: "Ship early, iterate often."*
- *Create a draft X post with this thread: "1/3 Our API is now public..."*
- *Publish this image post to Instagram now* (with `action: "PUBLISH"` and `schedule.type: "NOW"`)

### Errors

| Error | Cause |
| --- | --- |
| `Missing required context` | Invalid auth |
| Validation errors | Invalid `channelId`, schedule, media, or platform fields |
| Media errors | Unsupported URL, MIME type, or file size |

More examples: [`examples/`](./examples/)

---

## `get-posts`

Returns posts filtered by date range and optional criteria.

### Annotations

| Hint | Value |
| --- | --- |
| `readOnlyHint` | `true` |
| `destructiveHint` | `false` |
| `idempotentHint` | `true` |
| `openWorldHint` | `false` |

### Input

JSON schema: [`schemas/get-posts.input.json`](./schemas/get-posts.input.json)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | string | Yes | Start date (ISO 8601) |
| `to` | string | Yes | End date (ISO 8601) |
| `status` | string or array | No | `PROCESSING`, `FAILED`, `SCHEDULED`, `QUEUED`, `PUBLISHED`, `NEEDS_APPROVAL` |
| `platform` | string or array | No | `x`, `facebook`, `instagram`, `linkedin`, `youtube`, `tiktok`, `pinterest`, `google_business`, `mastodon`, `bluesky`, `threads` |
| `channelId` | string or array | No | Filter by channel |
| `labels` | string or array | No | Filter by label ID |
| `campaign` | string or array | No | Filter by campaign ID |
| `author` | string or array | No | Filter by author user ID |
| `labelMatch` | string | No | `ALL` or `ANY` (when filtering by multiple labels) |
| `view` | string | No | `list` (default), `day`, `week`, `month` |

### Response

```json
{
  "content": [
    { "type": "text", "text": "Posts fetched successfully." },
    { "type": "text", "text": "posts: [...]" }
  ],
  "structuredContent": {
    "posts": []
  }
}
```

### Example

```json
{
  "from": "2026-07-01T00:00:00.000Z",
  "to": "2026-07-31T23:59:59.999Z",
  "status": "SCHEDULED",
  "platform": "linkedin",
  "view": "list"
}
```

### Example prompts

- *Show all my scheduled Verlynk posts for this week*
- *List failed posts from the last 7 days*
- *What Instagram posts are queued in Verlynk?*

### Errors

| Error | Cause |
| --- | --- |
| `Missing required context` | Invalid auth |
| Empty results | No posts match filters (not an error) |

---

## Discovery workflow

Recommended order for agents:

1. **`list-channels`** → get `channelId` and `platform`
2. **Upload media** (if needed) → [MEDIA.md](./MEDIA.md)
3. **`create-posts`** → use platform fields from [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md)
4. **`get-posts`** → verify scheduling

---

## Related

- [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md)
- [MEDIA.md](./MEDIA.md)
- [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md)
- [examples/EXAMPLES.md](./examples/EXAMPLES.md)
