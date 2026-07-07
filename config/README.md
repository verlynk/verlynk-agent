# MCP Client Config Templates

Copy-paste JSON for connecting Verlynk MCP to your client.

## Before use

1. Replace `YOUR_MCP_KEY` with your MCP token (`mcp:access` scope)
2. Do **not** commit real keys to git
3. Prefer environment variables or your client's secret store where supported

## Files

| File | Client |
| --- | --- |
| [mcp-claude.json](./mcp-claude.json) | Claude Desktop |
| [mcp-cursor.json](./mcp-cursor.json) | Cursor IDE |
| [mcp-generic.json](./mcp-generic.json) | Any client using `mcp-remote` |

## Server details

| Setting | Value |
| --- | --- |
| URL | `https://verlynk.com/api/public/mcp` |
| Auth header | `Authorization: Bearer YOUR_MCP_KEY` |

Setup guide: [HOW_TO_CONNECT.md](../HOW_TO_CONNECT.md)
