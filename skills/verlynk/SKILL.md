---
name: verlynk
description: >-
  Schedule and manage social media posts, upload local media, list/reply/triage
  inbox comments, and pull analytics via the Verlynk CLI (`verlynk`) or MCP
  server. Use when the user wants to list channels, create/schedule/publish/queue
  posts (draft, once, recurring, approval), update/retry/delete posts, view a
  content calendar, validate captions, handle inbox comments, or check analytics.
---

# Verlynk Agent Skill

Schedule social posts across Facebook, Instagram, LinkedIn, X, YouTube, TikTok, Pinterest, Google Business, Mastodon, Bluesky, and Threads. Inbox, analytics, drafts, and post lifecycle are available via **MCP and CLI**.

## Install & links

```bash
npx skills add verlynk/verlynk-agent
npm install -g verlynk   # Node 18+ — NOT deprecated @verlynk/cli
```

| Resource | URL |
| --- | --- |
| npm | https://www.npmjs.com/package/verlynk |
| GitHub | https://github.com/verlynk/verlynk-agent |
| Docs | https://docs.verlynk.com |
| CLI posts | https://docs.verlynk.com/cli/posts |
| Examples | https://github.com/verlynk/verlynk-agent/tree/main/examples |

Verify: `verlynk --help` lists `media:upload`.

## Choose a path

| Situation | Use |
| --- | --- |
| Local image/video on disk | **CLI** — `media:upload` / `posts:create --media-file` |
| Text or public image URLs in MCP | **MCP** `create-posts` |
| Inbox / analytics / validate / usage | **MCP or CLI** |
| Edit / delete / retry / drafts | **MCP or CLI** |
| Queue / recurring / approval (`workflowId`) | **MCP** `create-posts` with `workflowId` **or** CLI `--json` |
| Non-default profile | `list-profiles` then MCP `profileId` **or** CLI `--profile-id` |
| Connect channels / API keys | **CLI / dashboard** (not MCP) |

**Media shapes — never mix:**

| Path | Fields |
| --- | --- |
| CLI / Public API | `{ mediaId, fileType, contentType }` |
| MCP | `{ mediaUrl, mimeType }` |

## Auth

| Surface | Credential |
| --- | --- |
| CLI / Public API | Public API key — `verlynk auth:login --key …` (preferred) or `VERLYNK_API_KEY` |
| MCP | MCP token (`mcp:access`) or OAuth |

Keys are not interchangeable.

## Profiles (multi-project)

When the user mentions another project/profile:

1. Call MCP `list-profiles` (or CLI `profiles:list`)
2. Match by `name` / pick non-default
3. Pass `profileId` on subsequent tools (`list-channels`, `get-posts`, `create-posts`, …)

`list-channels` echoes `profileId` + `profileName` in its response.

## Create — pick `action` + `schedule.type`

**Wrong pairs are rejected with HTTP 400.** Always verify with `posts:list` / `get-posts`.

| Goal | `action` | `schedule.type` | How |
| --- | --- | --- | --- |
| Draft | `DRAFT` | `DRAFT` | CLI `-t draft` or MCP `create-posts` |
| Publish now | `PUBLISH` | `NOW` | CLI `-t publish` or MCP |
| Schedule once | `SCHEDULE` | `ONCE` | CLI default / MCP |
| Weekly / monthly / custom | `SCHEDULE` | `RECURRING_*` | MCP or CLI `--json` (paid) |
| Channel queue | `QUEUE` | `QUEUE` + `NEXT`\|`LAST` | MCP or CLI `--json` (paid) |
| Needs approval | `NEEDS_APPROVAL` | `ONCE`/`QUEUE`/`RECURRING_*` | MCP/CLI with top-level `workflowId` |

Examples: https://github.com/verlynk/verlynk-agent/tree/main/examples

### CLI quick create

```bash
verlynk profiles:list && verlynk profiles:use <profile-id>
verlynk accounts:list --json
verlynk posts:create -c "Caption" -i "<channel-id>" -d "2026-07-16T05:30:00.000Z" --timezone Asia/Calcutta
verlynk posts:create --media-file ~/pic.png -c "Caption" -i "<channel-id>" -d "2026-07-16T05:30:00.000Z"
verlynk posts:create --json ./examples/create-queue-post.json
verlynk validate -t "$CAPTION" --strict
```

### MCP create-posts

- Optional `profileId` (discover via `list-profiles`)
- Optional top-level `workflowId`, `labels`, `campaign` for approval / tagging
- Confirm before `PUBLISH` / `SCHEDULE` unless user asked

## Edit / delete / retry

**MCP:** `update-post`, `retry-post`, `delete-post`  
**CLI:**

```bash
verlynk posts:update <post-id> --json ./examples/update-scheduled-post.json
verlynk posts:retry <post-id>
verlynk posts:delete <post-id> --yes
```

| Status | Edit | Delete |
| --- | --- | --- |
| `SCHEDULED` / `QUEUED` / `NEEDS_APPROVAL` | Yes | Yes |
| `PUBLISHED` | Limited platforms | Limited platforms — **not** IG/TikTok/GBP |
| `FAILED` | No → **retry** | Yes |
| `PROCESSING` | No | No |

## Drafts

**MCP:** `get-drafts`, `update-draft`, `delete-draft` (not returned by `get-posts`)  
**CLI:** `posts:drafts`, `drafts:update`, `drafts:delete`

## Inbox

**MCP:** `list-inbox`, `reply-inbox`, `update-inbox-status`  
**CLI:** `inbox:list`, `inbox:reply`, `inbox:status`

Verlynk never generates reply text — decide externally, then reply.

## Analytics / validate / usage

**MCP:** `get-post-analytics`, `get-best-time`, `validate-post-length`, `get-usage`  
**CLI:** `analytics:post`, `analytics:best-time`, `validate`, `usage`

## Limitations checklist

- Free plan: only `NOW` / `ONCE` / `DRAFT`; cap **10**/channel (also paid **trial**); paid after trial **300**/channel
- Soft `SCHEDULE` pairing → verify list after create
- Queue requires enabled queue + paid
- List range max 40 days on `publishAt`
- No create idempotency (duplicates possible)
- Local media upload remains CLI-only

## Errors

| Error | Action |
| --- | --- |
| `ChannelNotInProfile` | Use owning `--profile-id` / MCP `profileId` (from `list-profiles`) |
| `post.ScheduleFeature` | Paid required for queue/recurring |
| `Queue is not enabled` | Enable queue or use `SCHEDULE`/`ONCE` |
| Rejected pairing | Fix action×schedule; list posts |
| `INVALID_POST_STATUS_TO_UPDATE` | Wrong status — use retry for `FAILED` |
| `mediaUrl is not allowed` | Mixed MCP fields into CLI JSON |

## More docs

- https://github.com/verlynk/verlynk-agent/blob/main/MCP_TOOLS.md
- https://github.com/verlynk/verlynk-agent/blob/main/OPERATIONS.md
- https://github.com/verlynk/verlynk-agent/blob/main/MEDIA.md
- https://github.com/verlynk/verlynk-agent/blob/main/AUTHENTICATION.md
- https://docs.verlynk.com/cli/posts
