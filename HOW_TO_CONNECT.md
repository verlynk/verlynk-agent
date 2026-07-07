# How to Connect

Connect Verlynk MCP to your AI client.

**MCP server URL:** `https://verlynk.com/api/public/mcp`

**Authentication:** `Authorization: Bearer YOUR_MCP_KEY`

Create a key with the `mcp:access` scope: [Create MCP Token](https://docs.verlynk.com/getting-started/create-mcp-token)

---

## Claude Desktop

### Prerequisites

- Node.js 18+
- MCP token with `mcp:access` scope

### Setup

1. Open Claude Desktop → **Settings** → **Developer** → **Edit config**
2. Add the Verlynk server (or merge into existing `mcpServers`):

```json
{
  "mcpServers": {
    "Verlynk": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://verlynk.com/api/public/mcp",
        "--header",
        "Authorization: Bearer YOUR_MCP_KEY"
      ]
    }
  }
}
```

3. Restart Claude Desktop
4. Confirm **Verlynk** shows as connected in MCP settings

Template: [`config/mcp-claude.json`](./config/mcp-claude.json)

---

## Claude Code

### Setup

```bash
claude mcp add verlynk \
  --transport http \
  https://verlynk.com/api/public/mcp \
  --header "Authorization: Bearer YOUR_MCP_KEY"
```

### Verify

```bash
claude mcp list
```

---

## Cursor

### Prerequisites

- Node.js 18+
- MCP token with `mcp:access` scope

### Setup

1. Open Cursor → **Settings** (`Cmd+Shift+J` on Mac, `Ctrl+Shift+J` on Windows/Linux)
2. Go to the **MCP** tab
3. Add this configuration:

```json
{
  "mcpServers": {
    "Verlynk": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://verlynk.com/api/public/mcp",
        "--header",
        "Authorization: Bearer YOUR_MCP_KEY"
      ]
    }
  }
}
```

4. Save and confirm Verlynk shows a connected status

Template: [`config/mcp-cursor.json`](./config/mcp-cursor.json)

---

## ChatGPT

ChatGPT connects directly via **Connectors** — no local `mcp-remote` proxy.

### Setup

1. Open [chatgpt.com](https://chatgpt.com) → **Settings**
2. Navigate to **Connectors** (under **Apps** or **Beta features**)
3. Click **Add connector** or **New MCP server**
4. Enter:
   - **URL:** `https://verlynk.com/api/public/mcp`
   - **Authentication:** Custom header
   - **Header name:** `Authorization`
   - **Header value:** `Bearer YOUR_MCP_KEY`
5. Save and enable the connector

### Verify

Start a new chat, enable the Verlynk connector, and ask:

```
List my connected Verlynk channels
```

> ChatGPT MCP connector availability varies by plan and region. If Connectors are unavailable, use Claude, Cursor, or [other MCP clients](#other-mcp-clients).

---

## Other MCP Clients

Any MCP client that supports **HTTP MCP** with custom headers can connect.

### HTTP settings

| Setting | Value |
| --- | --- |
| URL | `https://verlynk.com/api/public/mcp` |
| Method | `POST` (JSON-RPC) |
| Header | `Authorization: Bearer YOUR_MCP_KEY` |

### Claude Desktop / Cursor (stdio bridge)

If your client only supports stdio MCP servers, use `mcp-remote` as a bridge:

```json
{
  "mcpServers": {
    "Verlynk": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://verlynk.com/api/public/mcp",
        "--header",
        "Authorization: Bearer YOUR_MCP_KEY"
      ]
    }
  }
}
```

Template: [`config/mcp-generic.json`](./config/mcp-generic.json)

### OAuth (alternative to API key)

Some clients (ChatGPT, Cursor, Claude) support OAuth against Verlynk instead of a static API key. See [docs.verlynk.com/integrations](https://docs.verlynk.com/integrations/claude) for OAuth setup. API keys are simpler for scripting and local development.

---

## Rate limits

MCP requests are rate-limited per workspace:

- **120 requests per minute**
- **Burst:** 30 requests per 10 seconds

See [Rate Limits](https://docs.verlynk.com/reference/rate-limits) for details.

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| `401 Unauthorized` | Check your MCP key is valid and has `mcp:access` scope |
| `403 API_KEY_SCOPE_DENIED` | Recreate the key with `mcp:access` scope |
| `429 Too Many Requests` | Back off and retry; see rate limits above |
| Tools not appearing | Restart the client after saving MCP config |
| `mcp-remote` fails | Ensure Node.js 18+ is installed and on PATH |
| Wrong default profile | MCP uses your account's default org/project; multi-profile orgs may need the web app to set defaults |

---

## Related

- [QUICK_START.md](./QUICK_START.md)
- [MCP_TOOLS.md](./MCP_TOOLS.md)
- [docs.verlynk.com/integrations](https://docs.verlynk.com/integrations/claude)
