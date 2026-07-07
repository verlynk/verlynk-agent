---
name: verlynk
description: Schedule and manage social media posts via the Verlynk MCP server. Use when the user wants to list channels, create/schedule/publish posts, or view their Verlynk content calendar.
---

# Verlynk MCP Agent Skill

Connect to Verlynk's hosted MCP server to manage social media posts across Facebook, Instagram, LinkedIn, X, YouTube, TikTok, Pinterest, Google Business, Mastodon, Bluesky, and Threads.

## Prerequisites

- Verlynk account with connected social channels
- MCP token with `mcp:access` scope **or** OAuth session (ChatGPT/Cursor/Claude)
- MCP server: `POST https://verlynk.com/api/public/mcp`
- Auth header: `Authorization: Bearer YOUR_MCP_KEY`

Setup: [HOW_TO_CONNECT.md](../../HOW_TO_CONNECT.md) · Auth details: [AUTHENTICATION.md](../../AUTHENTICATION.md)

## Available MCP tools

| Tool | Purpose | Read-only |
| --- | --- | --- |
| `list-channels` | List connected social accounts | Yes |
| `create-posts` | Create, schedule, publish, draft, or queue posts | No |
| `get-posts` | List and filter posts by date, status, platform | Yes |

Do **not** call tools not listed above. Only the three live tools are supported.

## Workspace context

MCP operates on the user's **default organization and default profile**. Agents cannot select a different profile via MCP. If the user has multiple profiles, ensure a default is set in the Verlynk app.

## Discovery workflow

### 1. Confirm MCP connection

Verify `list-channels`, `create-posts`, and `get-posts` are available.

### 2. List channels

```json
{}
```

From `structuredContent.channels[]`:

| Field | Use |
| --- | --- |
| `channelId` | Pass to `create-posts` as `channelId` |
| `platformName` | Determine platform-specific `metaData` fields |
| `channelName` | Display to user |

No server-side filters exist — filter client-side (e.g. `platformName === 'linkedin'`).

### 3. Upload media (if needed)

MCP has no upload tool. For local files or TikTok/Instagram/YouTube:

1. `POST /v1/media/presign` with Public API key (`posts:write`)
2. `PUT` file to `uploadUrl`
3. Use `publicUrl` as `mediaUrl` in `create-posts`

See [MEDIA.md](../../MEDIA.md).

### 4. Create posts

- `action`: `DRAFT` | `SCHEDULE` | `PUBLISH` | `QUEUE` | `NEEDS_APPROVAL`
- `posts[]`: `{ channelId, postType, metaData, schedule }`

Only include platform-specific `metaData` for the target `platformName`. See [PROVIDER_SETTINGS.md](../../PROVIDER_SETTINGS.md).

**Safety:** `create-posts` publishes to real social accounts (`openWorldHint: true`). Confirm before `PUBLISH`/`SCHEDULE` unless the user explicitly requested it.

### 5. Verify with get-posts

For **scheduled, published, or queued** posts only (not drafts):

```json
{
  "from": "2026-07-01",
  "to": "2026-07-31",
  "status": "SCHEDULED",
  "view": "list"
}
```

> **Drafts:** `action: "DRAFT"` is not returned by `get-posts`. Confirm drafts in the Verlynk dashboard.

## Tool quick reference

### list-channels

- **Input:** `{}`
- **Output:** `structuredContent.channels[]` — see [MCP_TOOLS.md#list-channels](../../MCP_TOOLS.md#list-channels)

### create-posts

- **Schema:** [schemas/create-posts.input.json](../../schemas/create-posts.input.json)
- **Schedule types:** `NOW`, `ONCE`, `DRAFT`, `QUEUE`, `RECURRING_WEEKLY`, `RECURRING_MONTHLY`, `RECURRING_CUSTOM`
- **Examples:** [examples/](../../examples/)

### get-posts

- **Schema:** [schemas/get-posts.input.json](../../schemas/get-posts.input.json)
- **Required:** `from`, `to` (ISO 8601 or `YYYY-MM-DD`)
- **Statuses:** `PROCESSING`, `FAILED`, `SCHEDULED`, `QUEUED`, `PUBLISHED`, `NEEDS_APPROVAL`

## Platform metadata (summary)

| platformName | Key metaData fields |
| --- | --- |
| `youtube` | `category`, `privacy`, `playlist`, `tags`, `madeForKids` |
| `tiktok` | `privacy`, `disableComment`, `disableDuet`, `disableStitch` |
| `x` | `replySettings`, `enableDirectMessaging` |
| `pinterest` | `board`, `altText`, `dominantColor` |
| `mastodon` | `visibility`, `isSensitive`, `spoilerText` |

`firstComment` is **not** supported on `mastodon`, `bluesky`, `threads`, `pinterest`.

## Error handling

| Error | Action |
| --- | --- |
| `401` / `Missing bearer token` | Reconnect; check MCP key |
| `API_KEY_SCOPE_DENIED` | Key needs `mcp:access` |
| `MCP_RATE_LIMIT_EXCEEDED` | Back off 60 s |
| `MCP_BURST_LIMIT_EXCEEDED` | Slow down; retry after 10 s |
| `Missing required context` | Set default profile in Verlynk app |
| `post.ScheduleFeature` | Free plan — use `NOW`/`ONCE`/`DRAFT` only |
| `post.UserDoesNotHavePostPermission` | User lacks Create/Publish on channel |
| Duplicate posts after retry | No server idempotency — see [OPERATIONS.md](../../OPERATIONS.md) |
| Validation on `create-posts` | Verify `channelId`, schedule, platform fields |
| Empty `get-posts` | Widen date range; check filters |

## Not available via MCP

- AI campaign scheduling, post analytics, channel connect, inbox, webhooks

Use [docs.verlynk.com](https://docs.verlynk.com) Public API or the Verlynk dashboard for these.

## Links

- [MCP_TOOLS.md](../../MCP_TOOLS.md) · [AUTHENTICATION.md](../../AUTHENTICATION.md) · [SECURITY.md](../../SECURITY.md)
- [OPERATIONS.md](../../OPERATIONS.md) · [FEATURES.md](../../FEATURES.md) · [examples/EXAMPLES.md](../../examples/EXAMPLES.md)
