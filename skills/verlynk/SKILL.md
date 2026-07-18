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

Schedule social posts across Facebook, Instagram, LinkedIn, X, YouTube, TikTok, Pinterest, Google Business, Mastodon, Bluesky, and Threads. List, reply to, and triage inbox comments via the **CLI** (not MCP).

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
| Inbox / analytics / validate | **CLI** |
| Edit / delete / retry / drafts list | **CLI** (MCP has no these tools) |
| Queue / recurring / approval (`workflowId`) | **CLI** `--json` (approval **not** via MCP) |
| Non-default profile | CLI `--profile-id` **or** MCP tool arg `profileId` (same org) |

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

## Create — pick `action` + `schedule.type`

**Wrong pairs can return HTTP 202 with zero posts.** Always verify with `posts:list` / `get-posts`.

| Goal | `action` | `schedule.type` | How |
| --- | --- | --- | --- |
| Draft | `DRAFT` | `DRAFT` | CLI `-t draft` or `--json` |
| Publish now | `PUBLISH` | `NOW` | CLI `-t publish` |
| Schedule once | `SCHEDULE` | `ONCE` | CLI default `-t schedule` |
| Weekly / monthly / custom | `SCHEDULE` | `RECURRING_*` | CLI `--json` (paid) |
| Channel queue | `QUEUE` | `QUEUE` + `NEXT`\|`LAST` | CLI `--json` (paid, queue on) |
| Needs approval | `NEEDS_APPROVAL` | `ONCE`/`QUEUE`/`RECURRING_*` | CLI `--json` + top-level `workflowId` — **not MCP** |

Examples: https://github.com/verlynk/verlynk-agent/tree/main/examples  
(`create-queue-post.json`, `create-recurring-*.json`, `create-needs-approval-post.json`, …)

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

- Optional `profileId` for another profile in the org
- Confirm before `PUBLISH` / `SCHEDULE` unless user asked
- Do **not** rely on MCP for `NEEDS_APPROVAL` (no `workflowId`)

## Edit / delete / retry (CLI)

```bash
verlynk posts:update <post-id> --json ./examples/update-scheduled-post.json   # body: action + singular "post"
verlynk posts:retry <post-id>     # FAILED only
verlynk posts:delete <post-id> --yes
```

| Status | Edit | Delete |
| --- | --- | --- |
| `SCHEDULED` / `QUEUED` / `NEEDS_APPROVAL` | Yes (content + reschedule) | Yes |
| `PUBLISHED` | Limited: FB (`post`), LinkedIn, YouTube, Mastodon — **no reschedule** | Platform delete: FB, LI, X, YT, Pinterest, Bluesky, Mastodon, Threads — **not** IG/TikTok/GBP |
| `FAILED` | No → **retry** | Yes (DB) |
| `PROCESSING` | No | No |

Edit `RECURRING_*` only when current status is `NEEDS_APPROVAL`. Never `action: DRAFT` on post update — use drafts endpoints.

## Drafts (CLI)

```bash
verlynk posts:create -t draft ...
verlynk posts:drafts --from 2026-07-01 --to 2026-07-31
verlynk drafts:update <draft-id> --json ./examples/update-draft-to-schedule.json   # 202 async
verlynk drafts:delete <draft-id> --yes
```

Not visible in MCP `get-posts`.

## Inbox (CLI only)

```bash
verlynk inbox:list --from 2026-07-01 --to 2026-07-16 --status OPEN --type COMMENT --json
verlynk inbox:reply <itemId> -m "<reply>" --json
verlynk inbox:status <itemId> --status CLOSED --json
```

## Limitations checklist

- Free plan: only `NOW` / `ONCE` / `DRAFT`; cap **10**/channel (also paid **trial**); paid after trial **300**/channel
- Soft `SCHEDULE` pairing → verify list after create
- Queue requires enabled queue + paid
- MCP: create/list only; no labels/campaign/`workflowId`
- List range max 40 days on `publishAt`
- No create idempotency (duplicates possible)

## Errors

| Error | Action |
| --- | --- |
| `ChannelNotInProfile` | Use owning `--profile-id` / MCP `profileId` |
| `post.ScheduleFeature` | Paid required for queue/recurring |
| `Queue is not enabled` | Enable queue or use `SCHEDULE`/`ONCE` |
| Soft empty create | Re-check action×schedule; list posts |
| `INVALID_POST_STATUS_TO_UPDATE` | Wrong status — use retry for `FAILED` |
| `mediaUrl is not allowed` | Mixed MCP fields into CLI JSON |

## More docs

- https://github.com/verlynk/verlynk-agent/blob/main/MCP_TOOLS.md
- https://github.com/verlynk/verlynk-agent/blob/main/OPERATIONS.md
- https://github.com/verlynk/verlynk-agent/blob/main/MEDIA.md
- https://github.com/verlynk/verlynk-agent/blob/main/AUTHENTICATION.md
- https://docs.verlynk.com/cli/posts
