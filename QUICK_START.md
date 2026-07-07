# Quick Start

Get connected to Verlynk MCP and run your first agent prompt in about 5 minutes.

## Step 1: Create an MCP token

1. Sign in to [Verlynk](https://verlynk.com)
2. Go to **Settings → Developer → Verlynk MCP**
3. Create an API key with the **`mcp:access`** scope
4. Copy the key — it starts with `verlynk_` and is shown only once

Detailed guide: [docs.verlynk.com/getting-started/create-mcp-token](https://docs.verlynk.com/getting-started/create-mcp-token)

> **Note:** Only org admins can create MCP tokens.

## Step 2: Connect your MCP client

Pick your client and follow the setup:

| Client | Guide |
| --- | --- |
| Claude Desktop | [HOW_TO_CONNECT.md#claude-desktop](./HOW_TO_CONNECT.md#claude-desktop) |
| Claude Code | [HOW_TO_CONNECT.md#claude-code](./HOW_TO_CONNECT.md#claude-code) |
| Cursor | [HOW_TO_CONNECT.md#cursor](./HOW_TO_CONNECT.md#cursor) |
| ChatGPT | [HOW_TO_CONNECT.md#chatgpt](./HOW_TO_CONNECT.md#chatgpt) |
| Other MCP clients | [HOW_TO_CONNECT.md#other-mcp-clients](./HOW_TO_CONNECT.md#other-mcp-clients) |

Config templates are in [`config/`](./config/). Replace `YOUR_MCP_KEY` with your token.

## Step 3: Verify the connection

Ask your agent:

```
List all my connected Verlynk channels
```

The agent should call the `list-channels` MCP tool and return your social accounts.

## Step 4: Create your first post

Try one of these prompts:

**Draft a text post:**

```
Create a draft LinkedIn post in Verlynk with this content:
"We're excited to share our latest product update. Read more on our blog."
```

**Schedule a post:**

```
Schedule this post on my LinkedIn channel for tomorrow at 9:00 AM IST:
"Monday motivation — ship early, iterate often."
```

**List scheduled posts:**

```
Show all my Verlynk posts scheduled for the next 7 days
```

## Step 5 (optional): Add media

MCP `create-posts` accepts a `mediaUrl` but does not upload files. For local images or videos:

1. Follow [MEDIA.md](./MEDIA.md) to upload via Public API presign
2. Use the returned `publicUrl` as `mediaUrl` in your post

## Install the agent skill

For richer agent context (discovery workflow, platform fields, examples):

```bash
npx skills add verlynk/verlynk-agent
```

## Next steps

- [MCP_TOOLS.md](./MCP_TOOLS.md) — full tool reference
- [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md) — YouTube, TikTok, X, etc.
- [examples/EXAMPLES.md](./examples/EXAMPLES.md) — JSON payloads and workflows
- [docs.verlynk.com](https://docs.verlynk.com) — Public API, rate limits, prompt examples
