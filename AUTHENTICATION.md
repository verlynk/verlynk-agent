# Authentication

How to authenticate with the Verlynk MCP server.

**MCP endpoint:** `POST https://verlynk.com/api/public/mcp`

**OIDC metadata (OAuth clients):** `GET https://verlynk.com/api/public/mcp/.well-known/openid-configuration`

---

## Authentication methods

Verlynk MCP supports two authentication methods:

| Method | Token type | Scope requirement | Typical clients |
| --- | --- | --- | --- |
| **API key** | `verlynk_*` prefix | `mcp:access` required | Claude Desktop, Cursor, scripts, ChatGPT (header auth) |
| **OAuth / JWT** | Cognito access token | No scope check on MCP | ChatGPT Connectors, Cursor OAuth, Claude OAuth |

Both methods resolve the same user context server-side (`userId`, `orgId`, `projectId`).

---

## API key authentication

### Create a key

1. Sign in as an **org admin**
2. Go to **Settings → Developer → Verlynk MCP**
3. Generate a key with the **`mcp:access`** scope
4. Copy the key immediately — it is shown only once

Guide: [docs.verlynk.com/getting-started/create-mcp-token](https://docs.verlynk.com/getting-started/create-mcp-token)

### Use the key

Send on every MCP request:

```http
Authorization: Bearer verlynk_xxxxxxxxxxxxxxxx
```

### Scope enforcement

When authenticating with an API key, the server enforces the `mcp:access` scope. Keys without this scope receive:

```json
{
  "errorCode": "API_KEY_SCOPE_DENIED",
  "message": "..."
}
```

### Org alignment

The API key's organization must match the authenticated user's **default organization**. If they differ, context resolution fails.

---

## OAuth / JWT authentication

Some MCP clients support OAuth against Verlynk instead of a static API key.

### Supported redirect URIs

OAuth is configured for:

- ChatGPT (`chatgpt.com`, `platform.openai.com`)
- Cursor (`cursor://anysphere.cursor-mcp/oauth/callback`)
- Claude (`claude.ai` MCP callbacks)

### OAuth flow

1. Client discovers metadata at `/.well-known/openid-configuration`
2. User authorizes via `GET /api/public/user/oauth/authorize`
3. Token exchange at `POST /api/public/user/oauth/token`
4. Client sends the Cognito JWT as `Authorization: Bearer <access_token>`

Setup per client: [docs.verlynk.com/integrations](https://docs.verlynk.com/integrations/claude)

### Scope note

JWT sessions do **not** require the `mcp:access` scope — the user is authenticated directly via Cognito.

---

## Workspace context (profiles)

MCP tools resolve the authenticated user's **default organization**. By default they also use the **default profile (project)**.

### Discover and switch (same as CLI)

1. Call **`list-profiles`** to see all projects (`id`, `name`, `isDefault`).
2. Optionally call **`get-profile`** with a known UUID.
3. Pass that profile’s UUID as tool argument **`profileId`** on other tools (`list-channels`, `get-posts`, `create-posts`, inbox, etc.).

`list-channels` returns `profileId` and `profileName` in its structured content so you can confirm which project you are viewing.

The server validates that `profileId` belongs to your default organization (`Invalid profileId: profile not found or does not belong to your organization` otherwise).

| Scenario | Behavior |
| --- | --- |
| No `profileId` | Default profile for the user |
| Valid `profileId` in org | That profile is used |
| Invalid / wrong-org `profileId` | Request fails |
| No default org/profile and no `profileId` | Context resolution fails |
| User says “another project” but no UUID | Call `list-profiles`, match by name, then retry with `profileId` |

CLI equivalent: `profiles:list` then `--profile-id` / `?profileId=`.

---

## Channel permissions

Creating posts requires the authenticated user to have:

- **Create** permission on the target channel
- **Publish** or **Needs approval** permission on the target channel

`list-channels` and `get-posts` only return channels the user has a role on. Permission errors surface as validation failures on `create-posts` (e.g. `post.UserDoesNotHavePostPermission`).

---

## Public API key (CLI and media)

Public API endpoints (`/api/v1/*`) require a **separate** Public API key — not the MCP key.

| Key | Scope / permission | Used for |
| --- | --- | --- |
| MCP key | `mcp:access` | `/api/public/mcp` |
| Public API key | `read` or `read-write` | CLI + Public API (`/api/v1/*`) |

`read` grants all `:read` scopes (including `inbox:read`, `posts:read`, …). `read-write` grants all scopes except `mcp:access` (including `inbox:write`, `posts:write`).

| Capability | Typical scopes |
| --- | --- |
| Media upload / posts | `posts:write` |
| Inbox list | `inbox:read` |
| Inbox reply / status | `inbox:write` |

Inbox is **CLI + Public API only** — not available via MCP. See [docs.verlynk.com/cli/inbox](https://docs.verlynk.com/cli/inbox) and [MEDIA.md](./MEDIA.md).

---

## Rate limits

| Limit | Value | errorCode |
| --- | --- | --- |
| Per minute | 120 requests | `MCP_RATE_LIMIT_EXCEEDED` |
| Burst (10 s) | 30 requests | `MCP_BURST_LIMIT_EXCEEDED` |

API key auth may also be subject to org-level Public API rate limits based on plan.

Details: [docs.verlynk.com/reference/rate-limits](https://docs.verlynk.com/reference/rate-limits)

---

## Error responses

| HTTP | errorCode / body | Meaning |
| --- | --- | --- |
| 401 | `Missing bearer token` | No `Authorization` header |
| 401 | `Invalid or expired token` | Bad JWT or API key |
| 401 | `UNAUTHORIZED` | Invalid API key |
| 403 | `API_KEY_SCOPE_DENIED` | Key lacks `mcp:access` |
| 429 | `MCP_RATE_LIMIT_EXCEEDED` | Minute limit hit |
| 429 | `MCP_BURST_LIMIT_EXCEEDED` | Burst limit hit |
| 429 | `API_RATE_LIMIT_EXCEEDED` | Org plan-based limit (API key auth only; 60–1200 req/min) |
| 500 | `Internal Server Error` | Server error — retry with backoff |

Tool-level errors (e.g. `Missing required context`, validation failures) are returned inside the MCP JSON-RPC response.

---

## Related

- [HOW_TO_CONNECT.md](./HOW_TO_CONNECT.md)
- [SECURITY.md](./SECURITY.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [SUPPORT.md](./SUPPORT.md)
- [MCP_TOOLS.md](./MCP_TOOLS.md)
