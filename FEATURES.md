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

---

## Not available via MCP (do not use)

| Feature | Status | Notes |
| --- | --- | --- |
| AI campaign scheduling | **Not live** | Backend tools exist but are disabled |
| `create-campaign` | **Not live** | Commented out in MCP server |
| `get-ai-campaign-posts` | **Not live** | Commented out in MCP server |
| `approve-ai-post` | **Not live** | Commented out in MCP server |
| `discard-ai-post` | **Not live** | Commented out in MCP server |
| `schedule-ai-campaign` | **Not live** | Commented out in MCP server |
| ChatGPT channel widget | **Not live** | Widget registration disabled |
| OAuth device flow for CLI | **Not available** | Use MCP API key instead |
| Inbox / DMs | **Not in MCP** | Scope defined; no MCP tool yet |
| Webhooks | **Not in MCP** | Scope defined; no MCP tool yet |

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
- npm CLI package

Track releases in [CHANGELOG.md](./CHANGELOG.md).
