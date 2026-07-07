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

## Workspace context (default profile)

MCP tools operate on the authenticated user's **default organization and default profile (project)**. This is resolved server-side; agents cannot pass a different `profileId` via MCP today.

| Scenario | Behavior |
| --- | --- |
| Single profile in org | That profile is used automatically |
| Multiple profiles | User must set a default profile in the Verlynk app |
| No default set | Context resolution fails with an error |

To work with a non-default profile, use the [Public API v1](https://docs.verlynk.com) with an explicit `profileId` query parameter instead of MCP.

---

## Channel permissions

Creating posts requires the authenticated user to have:

- **Create** permission on the target channel
- **Publish** or **Needs approval** permission on the target channel

`list-channels` and `get-posts` only return channels the user has a role on. Permission errors surface as validation failures on `create-posts` (e.g. `post.UserDoesNotHavePostPermission`).

---

## Public API key (media upload only)

Media presign (`POST /v1/media/presign`) requires a **separate** Public API key with `posts:write` — not the MCP key.

| Key | Scope | Endpoint |
| --- | --- | --- |
| MCP key | `mcp:access` | `/api/public/mcp` |
| Public API key | `posts:write` | `/api/v1/media/presign` |

See [MEDIA.md](./MEDIA.md).

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
| 500 | `Internal Server Error` | Server error — retry with backoff |

Tool-level errors (e.g. `Missing required context`, validation failures) are returned inside the MCP JSON-RPC response.

---

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [SECURITY.md](./SECURITY.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [SUPPORT.md](./SUPPORT.md)
- [MCP_TOOLS.md](./MCP_TOOLS.md)
