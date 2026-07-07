---
name: verlynk
description: Schedule and manage social media posts via the Verlynk MCP server. Use when the user wants to list channels, create/schedule/publish posts, or view their Verlynk content calendar.
---

# Verlynk MCP Agent Skill

Connect to Verlynk's hosted MCP server to manage social media posts across Facebook, Instagram, LinkedIn, X, YouTube, TikTok, Pinterest, Google Business, Mastodon, Bluesky, and Threads.

## Prerequisites

- Verlynk account with connected social channels
- MCP token with `mcp:access` scope
- MCP server URL: `https://verlynk.com/api/public/mcp`
- Auth header: `Authorization: Bearer YOUR_MCP_KEY`

Setup guide: [HOW_TO_CONNECT.md](../../HOW_TO_CONNECT.md)

## Available MCP tools

| Tool | Purpose | Read-only |
| --- | --- | --- |
| `list-channels` | List connected social accounts | Yes |
| `create-posts` | Create, schedule, publish, draft, or queue posts | No |
| `get-posts` | List and filter posts by date, status, platform | Yes |

Do **not** use tools that are not listed above — AI campaign tools are not live yet.

## Discovery workflow

Always follow this order:

### 1. Confirm MCP connection

Verify Verlynk MCP tools are available in the current session.

### 2. List channels

Call `list-channels` with `{}`.

From `structuredContent.channels`:
- Use `id` as `channelId` in `create-posts`
- Check `platform` to determine which metadata fields to include

### 3. Upload media (if needed)

MCP has no upload tool. For local files or platforms requiring trusted URLs (TikTok, Instagram, YouTube):

1. Use Public API `POST /v1/media/presign` (requires separate API key with `posts:write`)
2. PUT file to `uploadUrl`
3. Use `publicUrl` as `mediaUrl` in `create-posts`

See [MEDIA.md](../../MEDIA.md) and [examples/upload-media.sh](../../examples/upload-media.sh).

### 4. Create posts

Call `create-posts` with:
- `action`: `DRAFT`, `SCHEDULE`, `PUBLISH`, `QUEUE`, or `NEEDS_APPROVAL`
- `posts[]`: array of post objects with `channelId`, `postType`, `metaData`, `schedule`

Only include platform-specific `metaData` fields for the target platform. See [PROVIDER_SETTINGS.md](../../PROVIDER_SETTINGS.md).

**Important:** `create-posts` has `openWorldHint: true` — it publishes to real social media. Confirm with the user before `PUBLISH` or `SCHEDULE` unless they explicitly requested it.

### 5. Verify with get-posts

Call `get-posts` with `from`, `to`, and optional filters to confirm the post was created.

## Tool reference

### list-channels

**Input:** `{}` (no required fields; do not pass `_context`)

**Output:** `structuredContent.channels[]` with `id`, `platform`, `name`, etc.

**Example prompts:**
- "List my Verlynk channels"
- "Which LinkedIn accounts are connected?"

### create-posts

**Input schema:** [schemas/create-posts.input.json](../../schemas/create-posts.input.json)

**Key fields:**
- `action` — what to do with the post
- `posts[].channelId` — from `list-channels`
- `posts[].postType` — `post`, `reel`, `story`, `video`, `thread`, `pin`, `offer`, `event`
- `posts[].metaData.contents[]` — `title`, `text`, `media[]`
- `posts[].schedule` — discriminated by `type`: `NOW`, `ONCE`, `DRAFT`, `QUEUE`, `RECURRING_*`

**Schedule types:**
| type | Use when |
| --- | --- |
| `NOW` | Publish immediately (`action: "PUBLISH"`) |
| `ONCE` | Schedule for a specific datetime |
| `DRAFT` | Save as draft |
| `QUEUE` | Add to publishing queue (`queueType`: `NEXT` or `LAST`) |

**Example prompts:**
- "Draft a LinkedIn post: We shipped analytics v2"
- "Schedule this on X for tomorrow 9am IST: [content]"
- "Publish this image to Instagram now"

**Examples:** [examples/](../../examples/)

### get-posts

**Input schema:** [schemas/get-posts.input.json](../../schemas/get-posts.input.json)

**Required:** `from`, `to` (ISO 8601)

**Optional filters:** `status`, `platform`, `channelId`, `labels`, `campaign`, `author`, `labelMatch`, `view`

**Status values:** `PROCESSING`, `FAILED`, `SCHEDULED`, `QUEUED`, `PUBLISHED`, `NEEDS_APPROVAL`

**Platform values:** `x`, `facebook`, `instagram`, `linkedin`, `youtube`, `tiktok`, `pinterest`, `google_business`, `mastodon`, `bluesky`, `threads`

**Example prompts:**
- "Show scheduled posts for this week"
- "List failed Instagram posts from the last 7 days"

## Platform-specific metadata

Only include fields for the target platform inside `metaData`:

| Platform | Key fields |
| --- | --- |
| YouTube | `category`, `privacy`, `license`, `playlist`, `tags`, `madeForKids`, `notifySubscribers` |
| TikTok | `privacy`, `publishAsDraft`, `disableComment`, `disableDuet`, `disableStitch` |
| X | `replySettings`, `enableDirectMessaging` |
| Pinterest | `board`, `altText`, `dominantColor`, `boardSectionId` |
| Mastodon | `visibility`, `isSensitive`, `spoilerText` |

`firstComment` is **not** supported on Mastodon, Bluesky, Threads, or Pinterest.

Full reference: [PROVIDER_SETTINGS.md](../../PROVIDER_SETTINGS.md)

## Common patterns

### Schedule a text post

1. `list-channels` → get `channelId`
2. `create-posts` with `action: "SCHEDULE"`, `schedule.type: "ONCE"`

### Multi-platform post

1. `list-channels` → get IDs for each platform
2. `create-posts` with multiple items in `posts[]` — one per channel

### Image/video post

1. Upload media via presign (Public API) → get `publicUrl`
2. `list-channels` → get `channelId`
3. `create-posts` with `media: [{ mediaUrl, mimeType }]`

### Check queue before scheduling

1. `get-posts` with `status: "SCHEDULED"` for the target date range
2. Then `create-posts` if no conflicts

## Error handling

| Error | Action |
| --- | --- |
| `401 Unauthorized` | Check MCP key and `mcp:access` scope |
| `Missing required context` | MCP auth failed — reconnect |
| Validation error on `create-posts` | Verify `channelId`, schedule, and platform fields |
| Media error | Upload via presign; check MIME type and URL |
| Empty `get-posts` results | Widen date range or check filters |

## What is NOT available

Do not attempt these — they are not live in MCP:

- AI campaign tools (`create-campaign`, `approve-ai-post`, etc.)
- Post analytics via MCP
- Channel connect/disconnect via MCP
- Inbox or webhooks via MCP

For analytics, account management, and full API access, direct users to [docs.verlynk.com](https://docs.verlynk.com).

## Links

- [MCP_TOOLS.md](../../MCP_TOOLS.md) — full tool reference
- [FEATURES.md](../../FEATURES.md) — scope boundary
- [QUICK_START.md](../../QUICK_START.md) — setup walkthrough
- [examples/EXAMPLES.md](../../examples/EXAMPLES.md) — workflow examples
