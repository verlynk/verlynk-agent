# Verlynk Agent

Agent documentation, skills, and the **`verlynk`** package — schedule and manage social media posts (with or without images) from Claude Code, Cursor, ChatGPT, or any MCP client.

**Server version:** `verlynk-social-mcp` 1.0.0 · **CLI:** `verlynk` in [`cli/`](./cli/)

## Quick links

| Resource | URL |
| --- | --- |
| MCP server | `POST https://verlynk.com/api/public/mcp` |
| CLI | [`cli/README.md`](./cli/README.md) — `npm install -g verlynk` |
| Developer docs | [docs.verlynk.com](https://docs.verlynk.com) |
| Create MCP token | [Create MCP Token guide](https://docs.verlynk.com/getting-started/create-mcp-token) |
| Public API | [OpenAPI reference](https://docs.verlynk.com/api-reference) |
| Media upload | [MEDIA.md](./MEDIA.md) |

## Install

```bash
# Agent skill
npx skills add verlynk/verlynk-agent

# CLI (preferred for local images)
npm install -g verlynk
```

## Prerequisites

1. A [Verlynk](https://verlynk.com) account with connected social channels
2. For CLI: Public API key with **`posts:write`**
3. For MCP: MCP token with **`mcp:access`** (or OAuth)
4. Use the **profile that owns the channel** when posting (`--profile-id` / `profileId`)

## Agent recipes

**Text-only (CLI):**

```bash
verlynk posts:create -c "Caption" -i "<channel-id>" -d "2026-07-16T05:30:00.000Z" --timezone Asia/Calcutta
```

**Local image (CLI):**

```bash
verlynk posts:create --media-file ./photo.png -c "Caption" -i "<channel-id>" -d "2026-07-16T05:30:00.000Z"
```

**MCP media** uses `{ mediaUrl, mimeType }` only — never mix with CLI `{ mediaId, fileType, contentType }`. See [MEDIA.md](./MEDIA.md).

## What's available today

| Surface | Tools / commands |
| --- | --- |
| MCP | `list-channels`, `create-posts`, `get-posts` |
| CLI | `accounts:*`, `posts:*`, `media:upload`, `inbox:list`\|`reply`\|`status`, `profiles:*`, … |

See [FEATURES.md](./FEATURES.md) and [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md).

## Documentation

| File | Purpose |
| --- | --- |
| [QUICK_START.md](./QUICK_START.md) | First connection and first post |
| [HOW_TO_CONNECT.md](./HOW_TO_CONNECT.md) | Setup for Claude, Cursor, ChatGPT |
| [cli/README.md](./cli/README.md) | CLI reference including media |
| [MEDIA.md](./MEDIA.md) | CLI vs MCP media shapes (do not mix) |
| [MCP_TOOLS.md](./MCP_TOOLS.md) | MCP tool reference |
| [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md) | Agent skill |
| [examples/EXAMPLES.md](./examples/EXAMPLES.md) | Workflows |

## MCP vs Public API / CLI

| Use case | Path | Media fields |
| --- | --- | --- |
| Local files, Claude Code | **CLI** `media:upload` / `posts:create --media-file` | `mediaId`, `fileType`, `contentType` |
| MCP client + image URL | **MCP** `create-posts` | `mediaUrl`, `mimeType` |
| Text-only | Either | empty `media` |

| Key | Scope | Used for |
| --- | --- | --- |
| MCP key | `mcp:access` | MCP tools |
| Public API key | `read` / `read-write` (e.g. `posts:write`, `inbox:read`/`inbox:write`) | CLI, media, posts, inbox |

## Repository structure

```
verlynk-agent/
├── README.md
├── MEDIA.md             # CLI vs MCP media shapes
├── MCP_TOOLS.md
├── skills/verlynk/SKILL.md
├── cli/                 # verlynk source
├── config/              # MCP client config templates
├── schemas/             # JSON schemas for tool inputs
└── examples/            # Example payloads and scripts
```

## Support

Questions or issues: [SUPPORT.md](./SUPPORT.md) · [contact@verlynk.com](mailto:contact@verlynk.com)

## License

MIT — see [LICENSE](./LICENSE).
