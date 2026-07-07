# Security

Security practices for Verlynk MCP integrations.

---

## Token handling

- **Never commit tokens** to git, chat logs, or shared documents
- Store MCP keys in a password manager or secrets manager (e.g. AWS Secrets Manager, 1Password)
- Use environment variables in local config — not hardcoded strings in committed files
- Replace `YOUR_MCP_KEY` in [`config/`](./config/) templates before use; do not commit real keys

```bash
# Good — environment variable
export VERLYNK_MCP_KEY="verlynk_..."

# Bad — committed to repo
"Authorization: Bearer verlynk_live_abc123..."
```

---

## Least privilege

| Key type | Grant only |
| --- | --- |
| MCP integration | `mcp:access` |
| Media upload script | `posts:write` |
| Read-only automation | `posts:read`, `accounts:read` |

Do not use `read-write` permission keys for MCP when `mcp:access` suffices.

MCP keys **cannot** be created via Public API v1 — only org admins can provision them in the Verlynk dashboard.

---

## Token rotation

Rotate MCP keys:

- On a regular schedule (e.g. quarterly)
- Immediately if a key may have been exposed
- When a team member with access leaves the organization

To rotate: create a new key in **Settings → Developer → Verlynk MCP**, update your MCP client config, then revoke the old key.

---

## Production safeguards

### Confirm before publishing

The `create-posts` tool publishes content to **real social media accounts**. Agents should confirm with the user before:

- `action: "PUBLISH"`
- `action: "SCHEDULE"` (unless explicitly requested)
- Any post containing media or links

### Audit trail

State-changing operations in Verlynk are audit-logged server-side. Use the Verlynk dashboard to review post history and connected accounts.

### Transport

- All production traffic uses **HTTPS** (`https://verlynk.com`)
- MCP uses stateless JSON-RPC over `POST` — no persistent sessions
- SSE is not supported (`GET /api/public/mcp` returns `405`)

---

## OAuth vs API keys

| Concern | API key | OAuth (JWT) |
| --- | --- | --- |
| Static secret in config | Yes | No — short-lived tokens |
| Revocation | Revoke key in dashboard | Cognito session expiry |
| Best for | CI, local dev, header-based clients | ChatGPT, Cursor, Claude OAuth flows |

Prefer OAuth for interactive client integrations where supported.

---

## Reporting issues

Report security vulnerabilities to [contact@verlynk.com](mailto:contact@verlynk.com). Do not open public GitHub issues for security reports.

---

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [HOW_TO_CONNECT.md](./HOW_TO_CONNECT.md)
