# Features

What is available today via Verlynk MCP and related APIs.

This repo documents **only live, production features**. Items marked "Not available" are intentionally excluded until released.

**Requirements:** Active Verlynk subscription, connected channels, default profile set, and appropriate channel permissions.

---

## MCP tools (live)

| Feature | MCP tool | Status |
| --- | --- | --- |
| List connected channels | `list-channels` | **Live** |
| Create / schedule / publish posts | `create-posts` | **Live** |
| List and filter posts | `get-posts` | **Live** |

Server: `https://verlynk.com/api/public/mcp`

Auth: API key with `mcp:access` scope **or** OAuth JWT (ChatGPT, Cursor, Claude)

Context: operates on the user's **default profile** only — see [AUTHENTICATION.md](./AUTHENTICATION.md)

---

## Important limitations

| Limitation | Detail |
| --- | --- |
| Default profile only | MCP cannot target a non-default profile |
| Drafts not in `get-posts` | `action: "DRAFT"` saves to draft store — use dashboard to verify |
| `get-posts` date filter | Filters on `publishAt`, not `createdAt` |
| No idempotency | Duplicate `create-posts` calls create duplicate posts |
| Channel permissions | User must have Create + Publish on the channel |
| Free plan scheduling | Only `NOW`, `ONCE`, `DRAFT` schedule types |

Details: [OPERATIONS.md](./OPERATIONS.md)

---

## Public API supplements (live, not MCP)

| Feature | Endpoint | Status | Docs |
| --- | --- | --- | --- |
| Media upload (presign) | `POST /v1/media/presign` | **Live** | [MEDIA.md](./MEDIA.md) |
| Full post CRUD | `/v1/posts/*` | **Live** | [docs.verlynk.com](https://docs.verlynk.com) |
| List accounts | `GET /v1/accounts` | **Live** | [docs.verlynk.com](https://docs.verlynk.com) |
| Profiles | `/v1/profiles` | **Live** | [docs.verlynk.com](https://docs.verlynk.com) |
| Connect channels | `/v1/connect/*` | **Live** | [docs.verlynk.com](https://docs.verlynk.com) |
| Analytics | `/v1/analytics/*` | **Live** | [docs.verlynk.com](https://docs.verlynk.com) |
| Post length validation | `POST /v1/tools/validate/post-length` | **Live** | [docs.verlynk.com](https://docs.verlynk.com) |
| Inbox: list/reply/status (comments + replies) | `/v1/inbox/*` | **Live** (CLI: `inbox:list`\|`reply`\|`status`) | [docs.verlynk.com/cli/inbox](https://docs.verlynk.com/cli/inbox) |

---

## Not available via MCP (do not use)

| Feature | Status | Notes |
| --- | --- | --- |
| AI campaign scheduling | **Not available** | Use Public API or Verlynk dashboard |
| ChatGPT channel widget | **Not available** | — |
| OAuth device flow for CLI | **Not available** | Use MCP API key instead |
| Inbox (comments/replies) | **Not available via MCP** | Live via Public API + CLI (`inbox:list`\|`reply`\|`status`) — see [Public API supplements](#public-api-supplements-live-not-mcp) |
| DMs / mentions | **Not available** | Not yet implemented anywhere (Public API, CLI, or MCP) |
| Webhooks | **Not available via MCP** | Use Public API |
| Post analytics | **Not available via MCP** | Use Public API |
| Channel connect | **Not available via MCP** | Use Public API or dashboard |

---

## Supported social platforms

Channels on these platforms can be listed via `list-channels` and posted to via `create-posts`:

- Facebook (`facebook`)
- Instagram (`instagram`)
- LinkedIn (`linkedin`)
- X / Twitter (`x`)
- YouTube (`youtube`)
- TikTok (`tiktok`)
- Pinterest (`pinterest`)
- Google Business (`google_business`)
- Mastodon (`mastodon`)
- Bluesky (`bluesky`)
- Threads (`threads`)

---

## Authentication types

| Key type | Scope | Use for |
| --- | --- | --- |
| MCP key | `mcp:access` | MCP tools (`list-channels`, `create-posts`, `get-posts`) |
| Public API key | `posts:read`, `posts:write`, etc. | Media presign, full REST API |

Create MCP keys: [docs.verlynk.com/getting-started/create-mcp-token](https://docs.verlynk.com/getting-started/create-mcp-token)

---

## Rate limits

| Limit | Value | errorCode |
| --- | --- | --- |
| Per minute | 120 requests | `MCP_RATE_LIMIT_EXCEEDED` |
| Burst (10 s) | 30 requests | `MCP_BURST_LIMIT_EXCEEDED` |

Details: [docs.verlynk.com/reference/rate-limits](https://docs.verlynk.com/reference/rate-limits)

---

## Roadmap (not committed)

These may be added in future releases. They are **not documented as available** until shipped:

- AI campaign MCP tools
- Post analytics via MCP
- Channel connect via MCP
- OAuth device flow for local agents

The **npm CLI** (`verlynk` in [`cli/`](./cli/)) ships with this repo — see [cli/README.md](./cli/README.md).

Track releases in [CHANGELOG.md](./CHANGELOG.md).
