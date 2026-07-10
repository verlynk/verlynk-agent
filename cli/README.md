# Verlynk CLI

**Social media automation CLI for developers and AI agents** — schedule and manage posts across Facebook, Instagram, LinkedIn, X, YouTube, TikTok, and more.

The Verlynk CLI provides a command-line interface to the [Verlynk Public API](https://docs.verlynk.com), so you can authenticate, manage profiles and channels, create and schedule posts, inspect usage, and pull analytics from your terminal or agent workflows.

Requirements: **Node.js 18+**

---

## Installation

```bash
npm install -g @verlynk/cli
# or
pnpm install -g @verlynk/cli

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
# Schedule
verlynk posts:create -c "Hello from Verlynk!" -i "<channel-id>" -d "2026-07-15T09:00:00.000Z"

# Draft
verlynk posts:create -c "Draft content" -i "<channel-id>" -d "2026-07-15T09:00:00.000Z" -t draft

# Publish now
verlynk posts:create -c "We're live!" -i "<channel-id>" -t publish

# Multi-channel
verlynk posts:create -c "Launch day!" -i "id1,id2" -d "2026-07-20T14:00:00.000Z"

# From JSON
verlynk posts:create --json ./post.json

# Validate caption limits
verlynk validate -t "Hello from the CLI!"
verlynk validate -t "$CAPTION" --strict
```

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
verlynk posts:retry <post-id>
verlynk posts:delete <post-id> --yes
verlynk posts:drafts --from 2026-07-01 --to 2026-07-31
verlynk drafts:update <draft-id> --json ./draft.json
verlynk drafts:delete <draft-id> --yes
```

Date range for list/drafts is required (max 40 days).

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

| Error | Solution |
| --- | --- |
| `No authentication found` | Run `verlynk auth:login` or set `VERLYNK_API_KEY` |
| Profile resolution errors | `verlynk profiles:list` then `profiles:use <id>` |
| `API_KEY_SCOPE_DENIED` | Key is missing the required scope |
| `INVALID_PLAN` on analytics | Plan does not include that feature |

Rate limits: **120 req/min**, burst **30 / 10s**. See [Rate Limits](https://docs.verlynk.com/reference/rate-limits).

---

## Media Upload

Media upload is not a CLI command. Use the Public API presign endpoint, then pass the URL in your post JSON. Guide: [Media upload](https://github.com/verlynk/verlynk-agent/blob/main/MEDIA.md).

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
verlynk posts:create --json file.json
verlynk posts:list --from 2026-07-01 --to 2026-07-31
verlynk validate -t "text"

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
