---
name: verlynk
description: Schedule and manage social media posts, and list/reply/triage inbox comments, via the Verlynk CLI or MCP server. Use when the user wants to list channels, create/schedule/publish posts with or without images, view their Verlynk content calendar, or handle inbox comments.
---

# Verlynk Agent Skill

Schedule social posts across Facebook, Instagram, LinkedIn, X, YouTube, TikTok, Pinterest, Google Business, Mastodon, Bluesky, and Threads. List, reply to, and triage inbox comments via the CLI (not MCP).

## Choose a path

| Situation | Use |
| --- | --- |
| Local image/video files on disk (Claude Code) | **`verlynk`** — `media:upload` / `posts:create --media-file` |
| Text-only or public image URLs via MCP client | **MCP** `create-posts` |
| Inbox comments (list / reply / status) | **CLI only** — `inbox:list` / `inbox:reply` / `inbox:status` |
| Non-default profile | CLI `--profile-id` **or** MCP `profileId` |

**Media shapes differ — never mix:**

| Path | Media fields |
| --- | --- |
| CLI / Public API | `{ mediaId, fileType, contentType }` |
| MCP | `{ mediaUrl, mimeType }` |

Full guide: [MEDIA.md](../../MEDIA.md)

## Prerequisites

### CLI (recommended for files and inbox)

```bash
npm install -g verlynk
export VERLYNK_API_KEY=verlynk_...   # read-write Public API key (posts + inbox)
verlynk profiles:list
verlynk profiles:use <profile-id>
verlynk accounts:list --json
```

### MCP

- MCP token with `mcp:access` **or** OAuth
- Server: `POST https://verlynk.com/api/public/mcp`
- Optional: Public API key for uploading local files before MCP post
- Inbox is **not** available via MCP — use the CLI

Setup: [HOW_TO_CONNECT.md](../../HOW_TO_CONNECT.md)

## Discovery workflow

### 1. Resolve profile + channel

```bash
verlynk accounts:list --json
# Note channel _id and profileId._id — they must match when posting
```

Or MCP: `list-channels` (optionally `{ "profileId": "..." }`).

### 2. Text-only post (CLI)

```bash
verlynk posts:create \
  -c "Caption" \
  -i "<channel-id>" \
  -d "2026-07-16T05:30:00.000Z" \
  --timezone Asia/Calcutta \
  --profile-id "<profile-id>"
```

### 3. Post with local image (CLI — preferred)

```bash
verlynk posts:create --media-file ~/Pictures/quote.png \
  -c "Caption" \
  -i "<channel-id>" \
  -d "2026-07-16T05:30:00.000Z" \
  --timezone Asia/Calcutta \
  --profile-id "<profile-id>"
```

Or two steps: `verlynk media:upload ./photo.png --json` then `--media-id` / `--json` with `mediaId`.

### 4. MCP create-posts

- Text: `media: []` or omit media
- Image URL: `media: [{ "mediaUrl": "<cdn-or-https-url>", "mimeType": "image/png" }]`
- Non-default profile: pass `profileId` on the tool call

Confirm before `PUBLISH` / `SCHEDULE` unless the user explicitly asked.

### 5. Verify

```bash
verlynk posts:list --from 2026-07-01 --to 2026-07-31 --status SCHEDULED
```

Or MCP `get-posts`. Drafts are not returned by `get-posts` / may need the dashboard.

### 6. Inbox (CLI only)

Verlynk does **not** generate reply text — you supply `-m`. Date range is required (max 40 days). Only top-level `COMMENT` items are replyable.

```bash
# List open comments
verlynk inbox:list --from 2026-07-01 --to 2026-07-16 --status OPEN --type COMMENT --json

# Reply (agent-composed message)
verlynk inbox:reply <itemId> -m "<reply text>" --json

# Triage — reply does not auto-close
verlynk inbox:status <itemId> --status CLOSED --json
```

Docs: [docs.verlynk.com/cli/inbox](https://docs.verlynk.com/cli/inbox)

## MCP tools (if using MCP)

| Tool | Purpose |
| --- | --- |
| `list-channels` | List connected accounts |
| `create-posts` | Create / schedule / publish |
| `get-posts` | List posts by date/status |

Schema: [schemas/create-posts.input.json](../../schemas/create-posts.input.json) (MCP media shape only).

## Error handling

| Error | Action |
| --- | --- |
| `ChannelNotInProfile` | Use the `profileId` that owns the channel from `accounts:list` |
| `Invalid mediaId` / `Media upload is not complete` | Run `media:upload` or `POST .../complete` before create |
| `mediaUrl is not allowed` | You mixed MCP fields into CLI/Public API JSON — use `mediaId` |
| `API_KEY_SCOPE_DENIED` | Need `posts:write` / `inbox:read`/`inbox:write` (CLI) or `mcp:access` (MCP) |
| `MEDIA_PRESIGN_PROFILE_REQUIRED` | Pass `--profile-id` / `?profileId=` |
| `REPLY_NOT_SUPPORTED` | Item is a `REPLY` or has no linked post — reply to `parent.id` instead |
| `INBOX_ITEM_NOT_FOUND` | Re-check the id with `inbox:list` |

## Links

- [cli/README.md](../../cli/README.md) · [MEDIA.md](../../MEDIA.md) · [MCP_TOOLS.md](../../MCP_TOOLS.md)
- [examples/EXAMPLES.md](../../examples/EXAMPLES.md) · [AUTHENTICATION.md](../../AUTHENTICATION.md)
