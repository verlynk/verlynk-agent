# Verlynk Agent

Agent documentation and skills for the **Verlynk MCP server** — connect Claude, Cursor, ChatGPT, or any MCP client to schedule and manage social media posts.

This repo is **docs-only**. There is no npm CLI. Verlynk hosts the MCP server; you connect to it from your agent client.

**Server version:** `verlynk-social-mcp` 1.0.0

## Quick links

| Resource | URL |
| --- | --- |
| MCP server | `POST https://verlynk.com/api/public/mcp` |
| Developer docs | [docs.verlynk.com](https://docs.verlynk.com) |
| Create MCP token | [Create MCP Token guide](https://docs.verlynk.com/getting-started/create-mcp-token) |
| Public API (media upload) | [OpenAPI reference](https://docs.verlynk.com) |

## Install as a skill

```bash
npx skills add verlynk/verlynk-agent
```

## Prerequisites

1. A [Verlynk](https://verlynk.com) account with an active subscription and connected social channels
2. An MCP token with **`mcp:access`** scope (org admin) **or** OAuth via a supported client
3. A **default profile** set in Verlynk (required when your org has multiple profiles)
4. Node.js 18+ (only for `mcp-remote` proxy in Claude Desktop / Cursor)

## What's available today

| MCP tool | Description |
| --- | --- |
| `list-channels` | List connected social accounts in your default profile |
| `create-posts` | Create, schedule, publish, draft, or queue posts |
| `get-posts` | List and filter posts by date, status, platform, etc. |

See [FEATURES.md](./FEATURES.md) for the full scope boundary.

## 5-minute start

1. **Create an MCP token** — [Create MCP Token guide](https://docs.verlynk.com/getting-started/create-mcp-token)
2. **Connect your client** — [HOW_TO_CONNECT.md](./HOW_TO_CONNECT.md) or [`config/`](./config/)
3. **Try a prompt:**
   - *List all my connected Verlynk channels*
   - *Show my scheduled posts for this week*
   - *Draft a LinkedIn post: We just shipped our analytics dashboard*

Full walkthrough: [QUICK_START.md](./QUICK_START.md)

## Documentation

| File | Purpose |
| --- | --- |
| [QUICK_START.md](./QUICK_START.md) | First connection and first post |
| [HOW_TO_CONNECT.md](./HOW_TO_CONNECT.md) | Setup for Claude, Cursor, ChatGPT, other MCP clients |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | API key vs OAuth, scopes, context, rate limits |
| [SECURITY.md](./SECURITY.md) | Token handling, rotation, production safeguards |
| [MCP_TOOLS.md](./MCP_TOOLS.md) | Full reference for all 3 MCP tools |
| [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md) | Platform-specific post fields |
| [MEDIA.md](./MEDIA.md) | Upload media via Public API presign (curl) |
| [FEATURES.md](./FEATURES.md) | What's live vs not available |
| [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md) | Agent skill reference |
| [examples/EXAMPLES.md](./examples/EXAMPLES.md) | Workflow examples and JSON payloads |

## Supported platforms

Facebook, Instagram, LinkedIn, X (Twitter), YouTube, TikTok, Pinterest, Google Business, Mastodon, Bluesky, Threads.

Platform-specific fields: [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md).

## MCP vs Public API

| Use case | Path |
| --- | --- |
| List channels, create posts, list posts | **MCP tools** (default profile) |
| Upload media files | **Public API** `POST /v1/media/presign` — [MEDIA.md](./MEDIA.md) |
| Non-default profile, analytics, connect | **Public API v1** — [docs.verlynk.com](https://docs.verlynk.com) |

| Key | Scope | Used for |
| --- | --- | --- |
| MCP key | `mcp:access` | MCP tools |
| Public API key | `posts:write` | Media presign |

## Repository structure

```
verlynk-agent/
├── README.md
├── AUTHENTICATION.md
├── SECURITY.md
├── MCP_TOOLS.md
├── skills/verlynk/SKILL.md
├── config/              # MCP client config templates
├── schemas/             # JSON schemas for tool inputs
└── examples/            # Example payloads and scripts
```

## License

MIT — see [LICENSE](./LICENSE).
