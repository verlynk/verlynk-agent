# MCP Tools Reference

Full reference for tools on the Verlynk MCP server (`verlynk-social-mcp` v1.0.0).

| Property | Value |
| --- | --- |
| **Endpoint** | `POST https://verlynk.com/api/public/mcp` |
| **Protocol** | MCP over HTTP — stateless JSON-RPC (`StreamableHTTPServerTransport`) |
| **Auth** | `Authorization: Bearer <token>` — see [AUTHENTICATION.md](./AUTHENTICATION.md) |
| **OIDC metadata** | `GET https://verlynk.com/api/public/mcp/.well-known/openid-configuration` |

> `GET /api/public/mcp` returns `405 Method Not Allowed`. Clients must use `POST` only.

### Tool index

| Tool | Kind | Notes |
| --- | --- | --- |
| `list-profiles` | Read | Discover projects; use before switching |
| `get-profile` | Read | Single profile by UUID |
| `create-profile` / `update-profile` / `delete-profile` | Write | Profile CRUD |
| `list-channels` | Read | Returns `profileId`, `profileName`, `channels` |
| `create-posts` | Write | Supports `workflowId`, `labels`, `campaign` |
| `get-posts` | Read | Not drafts |
| `get-post` / `update-post` / `delete-post` / `retry-post` | Mixed | Post lifecycle |
| `get-drafts` / `update-draft` / `delete-draft` | Mixed | Draft store |
| `list-inbox` / `reply-inbox` / `update-inbox-status` | Mixed | Comments & replies |
| `get-post-analytics` / `get-best-time` | Read | Analytics (best-time may need AI plan) |
| `validate-post-length` | Read | Caption limits |
| `get-usage` | Read | Plan / channel usage |

---

## Context injection (`_context`)

All tools accept an optional `_context` object (`userId`, `orgId`, `projectId`). **Never pass this manually** — the server merges it from your auth token and the user's default org/profile.

If context resolution fails:

| Error | Cause |
| --- | --- |
| `Missing required context` | Auth failed or user has no default org/profile |
| `User does not have default organization or project set` | Set a default profile in the Verlynk app |
| `API key org does not match user default organization` | MCP key org ≠ user's default org |

See [AUTHENTICATION.md#workspace-context-profiles](./AUTHENTICATION.md#workspace-context-profiles).

---

## `list-profiles`

Lists organization profiles (projects). **Call this when the user mentions another project** — match by `name`, then pass `id` as `profileId` to other tools.

### Input

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `includeOverLimit` | boolean | No | Include plan-over-limit profiles (default false) |

### Response (`structuredContent.profiles[]`)

| Field | Type | Description |
| --- | --- | --- |
| `id` / `_id` | string (UUID) | Pass as `profileId` on other tools |
| `name` | string | Project name |
| `description` | string | Optional |
| `isDefault` | boolean | User’s default profile |
| `createdAt` | string | ISO timestamp |

### Example prompts

- *List my Verlynk projects*
- *There is another project — list channels from that one* → `list-profiles` then `list-channels` with `profileId`

---

## `list-channels`

Returns social accounts the authenticated user can publish to in their **default profile**, or a specific profile when `profileId` is set.

### Annotations

| Hint | Value |
| --- | --- |
| `readOnlyHint` | `true` |
| `destructiveHint` | `false` |
| `idempotentHint` | `true` |
| `openWorldHint` | `true` |

### Input

JSON schema: [`schemas/list-channels.input.json`](./schemas/list-channels.input.json)

```json
{}
```

Optional tool arg **`profileId`** selects which profile’s channels to list (same org). If you only know the project name, call `list-profiles` first.

### Response

```json
{
  "content": [
    { "type": "text", "text": "Channels fetched successfully." },
    { "type": "text", "text": "channels: {...}" }
  ],
  "structuredContent": {
    "profileId": "550e8400-e29b-41d4-a716-446655440000",
    "profileName": "Marketing",
    "channels": [
      {
        "channelId": "550e8400-e29b-41d4-a716-446655440000",
        "channelName": "Acme Corp",
        "platformName": "linkedin",
        "profileType": "page",
        "profileId": "provider-profile-id",
        "profileUrl": "https://linkedin.com/company/acme",
        "domain": "linkedin.com",
        "username": "acme-corp"
      }
    ]
  }
}
```

#### Channel object fields

| Field | Type | Description |
| --- | --- | --- |
| `channelId` | string (UUID) | Use as `channelId` in `create-posts` |
| `channelName` | string | Display name |
| `platformName` | string | Platform identifier (e.g. `linkedin`, `x`, `instagram`) |
| `profileType` | string | Provider profile type (e.g. `page`, `profile`) |
| `profileId` | string | Provider-side profile ID |
| `profileUrl` | string | Public profile URL |
| `domain` | string | Platform domain |
| `username` | string | Handle / username |

### Example prompts

- *List all my connected Verlynk channels*
- *Which LinkedIn accounts do I have connected in Verlynk?*
- *Show my X/Twitter channels*
- *List channels from my other project* → `list-profiles` then `list-channels` with `profileId`

Filter by platform in the agent: `channels.filter(c => c.platformName === 'linkedin')`.

---

## `create-posts`

Creates posts as draft, scheduled, published, queued, or pending approval.

**Always call `list-channels` first** to get valid `channelId` values.

The authenticated user must have **Create** and **Publish** (or **Needs approval**) permissions on the target channel.

### Action and schedule pairing

| `action` | `schedule.type` | Outcome |
| --- | --- | --- |
| `DRAFT` | `DRAFT` | Saved to draft store — **not** in `get-posts` |
| `PUBLISH` | Prefer `NOW` | Published immediately (other schedule types ignored) |
| `SCHEDULE` | `ONCE` / `RECURRING_*` | Scheduled — visible in `get-posts`. **Do not** use `SCHEDULE`+`NOW` (can accept with 0 posts). |
| `QUEUE` | `QUEUE` + `queueType` `NEXT`\|`LAST` | Queued (paid + queue enabled) |
| `NEEDS_APPROVAL` | `ONCE` / `QUEUE` / `RECURRING_*` | Requires top-level `workflowId` on `create-posts` |

See [PROVIDER_SETTINGS.md#action-and-schedule-pairing](./PROVIDER_SETTINGS.md#action-and-schedule-pairing), [OPERATIONS.md](./OPERATIONS.md), and [examples/](./examples/).

Post lifecycle tools: `get-post`, `update-post`, `delete-post`, `retry-post`, `get-drafts`, `update-draft`, `delete-draft`.

### Annotations

| Hint | Value |
| --- | --- |
| `readOnlyHint` | `false` |
| `destructiveHint` | `false` |
| `openWorldHint` | `true` — publishes to external social platforms |

> Confirm with the user before `PUBLISH` or `SCHEDULE` unless explicitly requested. See [SECURITY.md](./SECURITY.md).

### Input

JSON schema: [`schemas/create-posts.input.json`](./schemas/create-posts.input.json)

#### Top-level fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | string | Yes | `DRAFT`, `SCHEDULE`, `PUBLISH`, `QUEUE`, or `NEEDS_APPROVAL` |
| `posts` | array | Yes | One or more post objects |
| `workflowId` | string (UUID) | For `NEEDS_APPROVAL` | Approval workflow ID |
| `labels` | string[] | No | Label IDs |
| `campaign` | string | No | Campaign ID |
| `profileId` | string (UUID) | No | Target profile in the same org (see [AUTHENTICATION.md](./AUTHENTICATION.md)) |

#### Post object (`posts[]`)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `channelId` | string (UUID) | Yes | From `list-channels` → `channels[].channelId` |
| `postType` | string | Yes | `post`, `reel`, `story`, `video`, `thread`, `pin`, `offer`, `event` |
| `metaData` | object | Yes | Content and platform-specific fields |
| `schedule` | object | Yes | Discriminated union by `type` |

#### `metaData.contents[]`

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Post title (YouTube, Pinterest, etc.) |
| `text` | string | Post body / caption |
| `media` | array | `{ mediaUrl, mimeType }` attachments |

#### Media handling

> **MCP-only shape:** `{ mediaUrl, mimeType }`. This is **not** the Public API / CLI media object (`mediaId` / `fileType` / `contentType`). See [MEDIA.md](./MEDIA.md).

The server downloads `mediaUrl`, stores media in Verlynk S3, and validates per channel. Supported sources:

- `publicUrl` from [media presign](./MEDIA.md) (recommended for TikTok, Instagram, YouTube)
- Public HTTPS URLs
- Google Drive share links (converted server-side)

### Scheduling (`schedule`)

| `schedule.type` | `details` fields | Typical `action` |
| --- | --- | --- |
| `NOW` | `timezone` | `PUBLISH` |
| `ONCE` | `timezone`, `utc` (ISO 8601) | `SCHEDULE` |
| `DRAFT` | `timezone`, `utc` (ISO 8601) | `DRAFT` |
| `QUEUE` | `timezone`, `queueType` (`NEXT` or `LAST`) | `QUEUE` |
| `RECURRING_WEEKLY` | `timezone`, `daysOfWeek`, `utcStartDate`, `utcEndDate` | `SCHEDULE` |
| `RECURRING_MONTHLY` | `timezone`, `dayOfMonth` (1–31), `utcStartDate`, `utcEndDate` | `SCHEDULE` |
| `RECURRING_CUSTOM` | `timezone`, `utc` (array of ISO 8601 datetimes) | `SCHEDULE` |

Platform-specific `metaData` fields: [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md).

### Response

```json
{
  "content": [
    { "type": "text", "text": "Posts submitted for processing" }
  ],
  "structuredContent": {
    "status": "accepted",
    "count": 1
  }
}
```

`status: "accepted"` means validation passed and posts are queued for processing — not yet published.

### Example

Full worked payloads (queue, recurring, publish now): [examples/](./examples/).

```json
{
  "action": "SCHEDULE",
  "profileId": "optional-profile-uuid",
  "posts": [
    {
      "channelId": "550e8400-e29b-41d4-a716-446655440000",
      "postType": "post",
      "metaData": {
        "contents": [
          {
            "title": "",
            "text": "Excited to share our latest update!",
            "media": []
          }
        ]
      },
      "schedule": {
        "type": "ONCE",
        "details": {
          "timezone": "Asia/Kolkata",
          "utc": "2026-07-08T03:30:00.000Z"
        }
      }
    }
  ]
}
```

More examples: [`examples/`](./examples/)

---

## `get-posts`

Returns posts from the **post table** filtered by **`publishAt`** date range and optional criteria. Does **not** include drafts created with `action: "DRAFT"` — verify drafts in the Verlynk dashboard.

### Annotations

| Hint | Value |
| --- | --- |
| `readOnlyHint` | `true` |
| `destructiveHint` | `false` |
| `idempotentHint` | `true` |
| `openWorldHint` | `false` |

### Input

JSON schema: [`schemas/get-posts.input.json`](./schemas/get-posts.input.json)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | string | Yes | Start of `publishAt` range — ISO 8601 or `YYYY-MM-DD` |
| `to` | string | Yes | End of `publishAt` range — ISO 8601 or `YYYY-MM-DD` |
| `status` | string or array | No | See status values below |
| `platform` | string or array | No | See platform values below |
| `channelId` | string (UUID) or array | No | Filter by `channelId` from `list-channels` |
| `labels` | string (UUID) or array | No | Filter by label ID |
| `campaign` | string (UUID) or array | No | Filter by campaign ID |
| `author` | string (UUID) or array | No | Filter by author user ID |
| `labelMatch` | string | No | `ALL` or `ANY` (multi-label filter) |
| `view` | string | No | `list` (default), `day`, `week`, `month` |

**Status values:** `PROCESSING`, `FAILED`, `SCHEDULED`, `QUEUED`, `PUBLISHED`, `NEEDS_APPROVAL`

**Platform values:** `x`, `facebook`, `instagram`, `linkedin`, `youtube`, `tiktok`, `pinterest`, `google_business`, `mastodon`, `bluesky`, `threads`

### Response

```json
{
  "content": [
    { "type": "text", "text": "Posts fetched successfully." },
    { "type": "text", "text": "posts: [...]" }
  ],
  "structuredContent": {
    "posts": []
  }
}
```

#### Post object key fields

Each item in `structuredContent.posts[]` includes:

| Field | Type | Description |
| --- | --- | --- |
| `postId` | string (UUID) | Post identifier |
| `postType` | string | e.g. `post`, `video`, `reel` |
| `postStatus` | string | e.g. `SCHEDULED`, `PUBLISHED`, `QUEUED`, `FAILED` |
| `publishAt` | string (ISO 8601) | Scheduled or actual publish time |
| `metaData` | object | Post content (`contents[]`, platform fields) |
| `schedule` | object | Schedule type and details |
| `channel` | object | `channelId`, `channelName`, `platformName`, `profileUrl`, `username` |
| `author` | object | Author user info |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `errorMessage` | string | Present when `postStatus` is `FAILED` |

Full response shape: [docs.verlynk.com/api-reference](https://docs.verlynk.com/api-reference)

### Example

```json
{
  "from": "2026-07-01",
  "to": "2026-07-31",
  "status": "SCHEDULED",
  "platform": "linkedin",
  "view": "list"
}
```

---

## Additional tools (summary)

| Tool | Key inputs | Notes |
| --- | --- | --- |
| `get-profile` | `profileId` | Single profile |
| `create-profile` | `name`, `description?` | Plan project limits apply |
| `update-profile` | `profileId`, `name?`, `description?`, `isDefault?` | |
| `delete-profile` | `profileId` | Not default; no connected channels |
| `get-post` | `postId`, `profileId?` | |
| `update-post` | `postId`, `action`, `post`, … | MCP media shape |
| `delete-post` | `postId` | Destructive |
| `retry-post` | `postId` | `FAILED` only |
| `get-drafts` | `from`, `to`, filters | Max 40 days |
| `update-draft` | `draftId`, `action`, `posts` | Async accept |
| `delete-draft` | `draftId` | Destructive |
| `list-inbox` | `from`, `to`, filters | Max 40 days |
| `reply-inbox` | `itemId`, `message` | Top-level COMMENT only |
| `update-inbox-status` | `itemId`, `status` | `OPEN`\|`FOLLOWUP`\|`CLOSED` |
| `get-post-analytics` | `postId` | |
| `get-best-time` | `accountId`, `postType?` | May require AI plan |
| `validate-post-length` | `text` | |
| `get-usage` | — | Org billing/usage |

All profile-scoped tools accept optional `profileId` (discover via `list-profiles`).

---

## Discovery workflow

1. **`list-profiles`** (if multiple projects) → pick `id` as `profileId`
2. **`list-channels`** (with `profileId` if needed) → `channels[].channelId`
3. **Upload media** (if needed) → [MEDIA.md](./MEDIA.md)
4. **`create-posts`** → platform fields from [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md)
5. **`get-posts`** / **`get-drafts`** → verify

---

## Production operations

Rate limits, retry policy, idempotency, plan limits, and permissions: [OPERATIONS.md](./OPERATIONS.md)

---

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [SECURITY.md](./SECURITY.md)
- [PROVIDER_SETTINGS.md](./PROVIDER_SETTINGS.md)
- [MEDIA.md](./MEDIA.md)
- [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md)
- [examples/EXAMPLES.md](./examples/EXAMPLES.md)
