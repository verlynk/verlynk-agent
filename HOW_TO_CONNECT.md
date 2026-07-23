# How to Connect

Connect Verlynk MCP to your AI client.

**MCP server URL:** `https://verlynk.com/api/public/mcp`

**Authentication:** `Authorization: Bearer YOUR_MCP_KEY`

Create a key with the `mcp:access` scope: [Create MCP Token](https://docs.verlynk.com/getting-started/create-mcp-token)

---

## Claude (claude.ai / Desktop) — Custom Connector (recommended)

Claude connects to Verlynk as a **remote MCP custom connector**. No local Node.js proxy and no MCP token are required for the usual flow — authenticate with **Verlynk OAuth** when you click **Connect**.

Official Anthropic guide: [Custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)

### Prerequisites

- Verlynk account with connected social channels

### Setup

1. Open [claude.ai](https://claude.ai) or Claude Desktop → **Settings** (or **Customize**) → **Connectors**
2. Click **+** → **Add custom connector**
3. Enter:
   - **Name:** `Verlynk`
   - **Remote MCP server URL:** `https://verlynk.com/api/public/mcp`
4. Click **Add** (leave advanced OAuth client fields empty; do not add request headers)
5. Click **Connect** on Verlynk and complete Verlynk sign-in / authorize
6. In a chat, open **+** → **Connectors** and enable **Verlynk**

Docs: [docs.verlynk.com/integrations/claude](https://docs.verlynk.com/integrations/claude)

> **Team / Enterprise:** An Owner must add the connector under Admin / Organization settings → Connectors before members can **Connect**.

---

## Claude Desktop — local config (optional)

Use only if you prefer a local `mcp-remote` bridge instead of a custom connector.

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

| Limit | Value | errorCode |
| --- | --- | --- |
| Per minute | 120 requests | `MCP_RATE_LIMIT_EXCEEDED` |
| Burst (10 s) | 30 requests | `MCP_BURST_LIMIT_EXCEEDED` |

See [Rate Limits](https://docs.verlynk.com/reference/rate-limits) and [AUTHENTICATION.md](./AUTHENTICATION.md).

---

## Default profile requirement

MCP tools use your account's **default organization and default profile**. If you have multiple profiles, set a default in the Verlynk app before using MCP.

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| `401 Unauthorized` | Check MCP key is valid and has `mcp:access` scope |
| `403 API_KEY_SCOPE_DENIED` | Recreate key with `mcp:access` scope |
| `429 MCP_RATE_LIMIT_EXCEEDED` | Wait 60 seconds and retry |
| `429 MCP_BURST_LIMIT_EXCEEDED` | Slow down; wait 10 seconds |
| Tools not appearing | Restart client after saving MCP config |
| `mcp-remote` fails | Ensure Node.js 18+ is on PATH |
| `Missing required context` | Set default profile in Verlynk app |
| `API key org does not match user default organization` | Use a key from your default org or change default org |

---

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [QUICK_START.md](./QUICK_START.md)
- [MCP_TOOLS.md](./MCP_TOOLS.md)
- [docs.verlynk.com/integrations](https://docs.verlynk.com/integrations/claude)
