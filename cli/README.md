# Verlynk CLI

**Social media automation CLI for developers and AI agents** — schedule and manage posts across Facebook, Instagram, LinkedIn, X, YouTube, TikTok, and more.

The Verlynk CLI provides a command-line interface to the [Verlynk Public API](https://docs.verlynk.com), so you can authenticate, manage profiles and channels, create and schedule posts, inspect usage, and pull analytics from your terminal or agent workflows.

Requirements: **Node.js 18+**

## Links

- **npm:** [npmjs.com/package/verlynk](https://www.npmjs.com/package/verlynk)
- **GitHub:** [github.com/verlynk/verlynk-agent](https://github.com/verlynk/verlynk-agent)

---

## Installation

```bash
npm install -g verlynk
# or
pnpm install -g verlynk

verlynk --version
```

---

## Authentication

### Option 1: Stored API key (Recommended)

```bash
verlynk auth:login --key verlynk_your_key_here
```

Optionally set a default profile at login:

```bash
verlynk auth:login --key verlynk_your_key_here --profile-id <profile-uuid>
```

Credentials are saved to:

- **Windows:** `%USERPROFILE%\.verlynk\credentials.json`
- **macOS/Linux:** `~/.verlynk/credentials.json`

```bash
verlynk auth:status
verlynk auth:logout
```

Create an API key in **Settings → Developer** on [verlynk.com](https://verlynk.com), or with `verlynk keys:create`.

### Option 2: Environment variable

```bash
export VERLYNK_API_KEY=verlynk_your_key_here
# optional
export VERLYNK_API_URL=https://verlynk.com/api
export VERLYNK_PROFILE_ID=<profile-uuid>
```

> **Note:** Stored credentials from `auth:login` take priority when both are present.

---

## Profiles (projects)

Most post and account commands need a **profile** context.

Resolution order:

1. `--profile-id` on the command
2. `VERLYNK_PROFILE_ID`
3. Saved profile (`profiles:use` or login `--profile-id`)
4. Auto-select if the org has one profile / a default
5. Otherwise the CLI exits with available profiles

```bash
verlynk profiles:list
verlynk profiles:use <profile-uuid>
verlynk profiles:create --name "Marketing Team"
```

---

## Commands

### Accounts (channels)

```bash
verlynk accounts:list
verlynk accounts:list --platform linkedin
verlynk accounts:list --json
verlynk accounts:disconnect <account-id> --yes
```

### Creating Posts

```bash
# Schedule once
verlynk posts:create -c "Hello from Verlynk!" -i "<channel-id>" -d "2026-07-15T09:00:00.000Z"

# Draft
verlynk posts:create -c "Draft content" -i "<channel-id>" -d "2026-07-15T09:00:00.000Z" -t draft

# Publish now
verlynk posts:create -c "We're live!" -i "<channel-id>" -t publish

# Multi-channel
verlynk posts:create -c "Launch day!" -i "id1,id2" -d "2026-07-20T14:00:00.000Z"

# From JSON (queue, recurring, needs approval, …)
verlynk posts:create --json ./post.json

# Validate caption limits
verlynk validate -t "Hello from the CLI!"
verlynk validate -t "$CAPTION" --strict
```

CLI `-t schedule|draft|publish` maps to `ONCE` / `DRAFT` / `NOW` only. For `QUEUE`, `RECURRING_*`, and `NEEDS_APPROVAL` (+ `workflowId`), use `--json` — see [examples/](../examples/) and [docs.verlynk.com/cli/posts](https://docs.verlynk.com/cli/posts).

**Pairing:** `action: SCHEDULE` only accepts `ONCE` / recurring. `SCHEDULE` + `NOW` is rejected with **400** — prefer `PUBLISH` + `NOW`.

**`posts:create` options:**

| Flag | Description |
| --- | --- |
| `-c, --content` | Post text / caption |
| `-i, --accounts` | Comma-separated channel IDs from `accounts:list` |
| `-d, --date` | Schedule datetime in ISO 8601 UTC (required for `schedule` / `draft`) |
| `-t, --type` | `schedule` (default), `draft`, or `publish` |
| `--timezone` | IANA timezone (default `UTC`) |
| `--post-type` | `post`, `reel`, `story`, `video`, `thread`, `pin`, `offer`, `event` |
| `--settings` | Platform-specific settings as JSON string |
| `-j, --json` | Path to full post payload JSON |
| `--profile-id` | Override profile for this command |

### Managing Posts

```bash
verlynk posts:list --from 2026-07-01 --to 2026-07-31
verlynk posts:list --from 2026-07-01 --to 2026-07-31 --status SCHEDULED
verlynk posts:get <post-id>
verlynk posts:update <post-id> -c "Updated text" -i "<channel-id>" -d "2026-07-16T09:00:00.000Z"
verlynk posts:update <post-id> --json ./examples/update-scheduled-post.json
verlynk posts:retry <post-id>          # FAILED only
verlynk posts:delete <post-id> --yes
verlynk posts:drafts --from 2026-07-01 --to 2026-07-31
verlynk drafts:update <draft-id> --json ./draft.json
verlynk drafts:delete <draft-id> --yes
```

Edit: `SCHEDULED` / `QUEUED` / `NEEDS_APPROVAL` / limited `PUBLISHED` (FB, LinkedIn, YouTube, Mastodon). Delete is hard; published IG/TikTok/GBP platform delete unsupported. Full matrices: [docs.verlynk.com/cli/posts](https://docs.verlynk.com/cli/posts).

Date range for list/drafts is required (max 40 days).

### Inbox (comments & replies)

Built for AI agents: fetch comments, decide externally what to say, reply, and triage — Verlynk never generates reply text.

```bash
verlynk inbox:list --from 2026-07-01 --to 2026-07-16 --status OPEN --json
verlynk inbox:reply <item-id> -m "Thanks for your feedback!"
verlynk inbox:status <item-id> --status CLOSED
```

Only top-level comments (`type: "COMMENT"`) can be replied to; date range is required (max 40 days). See [docs.verlynk.com/cli/inbox](https://docs.verlynk.com/cli/inbox).

### Analytics

```bash
verlynk analytics:post <post-id>
verlynk analytics:best-time -a <channel-id>
verlynk analytics:best-time -a <channel-id> --top 10 --json
```

### API Keys

```bash
verlynk keys:list
verlynk keys:create --name "CI Deploy" --permission read-write
verlynk keys:delete <key-id> --yes
```

`keys:create` prints the full key **once** — store it immediately.

### Usage

```bash
verlynk usage
verlynk usage --json
```

---

## Common Workflows

```bash
# Schedule across channels
verlynk posts:create -c "Launch day!" -i "id1,id2" -d "2026-07-20T14:00:00.000Z"

# CI / scripts
export VERLYNK_API_KEY=verlynk_xxx
export VERLYNK_PROFILE_ID=<profile-uuid>
verlynk validate -t "$CAPTION" --strict
verlynk posts:list --from 2026-07-01 --to 2026-07-31 --json

# Create automation key
verlynk keys:create --name "CI Deploy" --permission read-write

# Check plan limits
verlynk usage
```

---

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VERLYNK_API_KEY` | No* | — | Public API key (`verlynk_...`) |
| `VERLYNK_API_URL` | No | `https://verlynk.com/api` | Custom API base URL |
| `VERLYNK_PROFILE_ID` | No | — | Default profile UUID |

\*Either `verlynk auth:login` or `VERLYNK_API_KEY` is required.

---

## Error Handling

- **Exit code 0** — Success
- **Exit code 1** — Error (`Error: ...` on stderr)
- `validate --strict` exits `1` when any platform exceeds its limit
- Destructive commands require `--yes` / `-y`: `posts:delete`, `drafts:delete`, `keys:delete`, `profiles:delete`, `accounts:disconnect`
- `inbox:list` / `inbox:reply` / `inbox:status` with `--json`: on failure, prints a single JSON object (`{ errorCode, message, retryable, action }`) on stderr instead of `Error: ...` text — safe for agents to parse

| Error | Solution |
| --- | --- |
| `No authentication found` | Run `verlynk auth:login` or set `VERLYNK_API_KEY` |
| Profile resolution errors | `verlynk profiles:list` then `profiles:use <id>` |
| `API_KEY_SCOPE_DENIED` | Key is missing the required scope |
| `INVALID_PLAN` on analytics | Plan does not include that feature |
| `REPLY_NOT_SUPPORTED` on `inbox:reply` | Item is a `REPLY` or has no linked post — reply to the top-level comment instead |
| `BAD_REQUEST` on inbox commands | Empty `--message`, invalid dates, or range over 40 days |

Rate limits: **120 req/min**, burst **30 / 10s**. See [Rate Limits](https://docs.verlynk.com/reference/rate-limits).

---

## Media Upload

Upload local files, then attach them to posts. **Do not** use MCP fields (`mediaUrl` / `mimeType`) in CLI JSON — those are MCP-only.

```bash
# Upload and print mediaId
verlynk media:upload ./photo.png --json

# One-shot: upload + schedule
verlynk posts:create --media-file ./photo.png \
  -c "Caption" -i "<channel-id>" -d "2026-07-16T05:30:00.000Z" --timezone Asia/Calcutta

# Or attach a completed mediaId
verlynk posts:create --media-id "<uuid>" --content-type image/png \
  -c "Caption" -i "<channel-id>" -d "2026-07-16T05:30:00.000Z"
```

Public API media object shape for `--json` payloads:

```json
{
  "mediaId": "<from media:upload>",
  "fileType": "image",
  "contentType": "image/png"
}
```

| Presign `type` | Post `fileType` |
| --- | --- |
| `image` | `image` |
| `video` | `video` |
| `document` | `application` |

Requires a Public API key with `posts:write`. Guide: [MEDIA.md](../MEDIA.md).

---

## Quick Reference

```bash
# Auth
verlynk auth:login --key verlynk_xxx
verlynk auth:status
verlynk auth:logout

# Profiles & accounts
verlynk profiles:list
verlynk profiles:use <id>
verlynk accounts:list --json

# Posts
verlynk posts:create -c "text" -i "id" -d "2026-07-15T09:00:00.000Z"
verlynk posts:create -c "text" -i "id" -t publish
verlynk media:upload ./photo.png --json
verlynk posts:create --media-file ./photo.png -c "Caption" -i "id" -d "2026-07-15T09:00:00.000Z"
verlynk posts:create --json file.json
verlynk posts:list --from 2026-07-01 --to 2026-07-31
verlynk validate -t "text"

# Inbox
verlynk inbox:list --from 2026-07-01 --to 2026-07-16 --status OPEN --json
verlynk inbox:reply <item-id> -m "Thanks for your feedback!"
verlynk inbox:status <item-id> --status CLOSED

# Analytics & usage
verlynk analytics:post <id>
verlynk analytics:best-time -a <channel-id>
verlynk usage

# Help
verlynk --help
verlynk posts:create --help
```

---

## Agent skills & MCP

For Claude, Cursor, ChatGPT, and other MCP clients:

```bash
npx skills add verlynk/verlynk-agent
```

Docs: [github.com/verlynk/verlynk-agent](https://github.com/verlynk/verlynk-agent)

---

## Links

- **Website:** [verlynk.com](https://verlynk.com)
- **API Docs:** [docs.verlynk.com](https://docs.verlynk.com)
- **GitHub:** [verlynk/verlynk-agent](https://github.com/verlynk/verlynk-agent)
- **Support:** [contact@verlynk.com](mailto:contact@verlynk.com)

## License

MIT
