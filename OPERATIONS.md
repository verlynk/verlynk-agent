# Operations Guide

Production guidance for running Verlynk MCP integrations at scale.

---

## Service levels

| Property | Value |
| --- | --- |
| Production base URL | `https://verlynk.com` |
| MCP endpoint | `POST /api/public/mcp` |
| Transport | Stateless JSON-RPC over HTTPS |
| Availability | See [Verlynk Status](https://verlynk.com) and [docs.verlynk.com](https://docs.verlynk.com) |

This documentation repo is versioned independently of the MCP server. Server identity: `verlynk-social-mcp` **1.0.0**.

---

## Prerequisites checklist

Before production use, confirm:

- [ ] Active Verlynk subscription on the organization
- [ ] Social channels connected and in **connected** state
- [ ] Default profile set (multi-profile orgs)
- [ ] MCP token with `mcp:access` (or OAuth for supported clients)
- [ ] User has **Create** + **Publish** (or **Needs approval**) permissions on target channels
- [ ] Rate limit expectations documented for your automation volume

---

## Rate limits and backoff

### MCP-specific limits

| Limit | Value | errorCode | Retry guidance |
| --- | --- | --- | --- |
| Per minute | 120 requests | `MCP_RATE_LIMIT_EXCEEDED` | Wait 60 s, exponential backoff |
| Burst (10 s) | 30 requests | `MCP_BURST_LIMIT_EXCEEDED` | Wait 10 s, reduce concurrency |

### API key org limits (MCP with API key auth)

Organizations using API key auth on MCP may also hit org-level Public API rate limits based on plan size (60–1200 req/min, `errorCode: API_RATE_LIMIT_EXCEEDED`). JWT/OAuth sessions are not subject to API key rate limiting.

### Recommended retry policy

```
429 MCP_BURST_LIMIT_EXCEEDED  → retry after 10–30 s
429 MCP_RATE_LIMIT_EXCEEDED   → retry after 60 s
429 API_RATE_LIMIT_EXCEEDED   → retry after 60 s (API key auth only)
500 Internal Server Error     → retry up to 3× with exponential backoff (1 s, 2 s, 4 s)
4xx validation errors         → do not retry; fix the request
```

---

## Idempotency

The MCP server does **not** deduplicate `create-posts` requests. Calling `create-posts` twice with the same payload creates **two posts**.

Agents and automations must:

- Confirm with users before publishing
- Track submitted payloads client-side if retrying after network errors
- Use `get-posts` to verify outcomes (see limitations below for drafts)

---

## Known behavioral limits

### Drafts are not returned by `get-posts`

| `action` | Storage | Visible in `get-posts`? |
| --- | --- | --- |
| `DRAFT` | Draft table | **No** — verify in Verlynk dashboard |
| `SCHEDULE`, `PUBLISH`, `QUEUE`, `NEEDS_APPROVAL` | Post table | **Yes** (by `publishAt` date range) |

`get-posts` filters on **`publishAt`**, not `createdAt`. Use date ranges that include the scheduled publish time.

### Channel permissions

Both `list-channels` and `get-posts` return only channels the authenticated user has a role on. Users without **Create** + **Publish** permissions cannot create posts on a channel even if it appears in a shared org.

### Plan limits (scheduling)

| Plan | Schedule types allowed | Scheduled post cap (per channel) |
| --- | --- | --- |
| Free / no plan | `NOW`, `ONCE`, `DRAFT` only | **10** |
| Paid + **trial active** | All types including recurring, queue | **10** |
| Paid (trial ended) | All types including recurring, queue | **300** |

Recurring and queue schedules on free plans fail validation (`post.ScheduleFeature`).

### Action × schedule pairing (create)

| `action` | Working `schedule.type` | Notes |
| --- | --- | --- |
| `DRAFT` | `DRAFT` only | Hard reject otherwise |
| `PUBLISH` | Prefer `NOW` | Other types ignored; still publishes now |
| `SCHEDULE` | `ONCE`, `RECURRING_*` | **`SCHEDULE` + `NOW`/`QUEUE`/`DRAFT` can return 202 with 0 posts** |
| `QUEUE` | `QUEUE` + `NEXT`/`LAST` | Queue must be enabled on channel |
| `NEEDS_APPROVAL` | `ONCE`, `QUEUE`, `RECURRING_*` | Runtime requires top-level `workflowId` on MCP `create-posts` or Public/CLI |

### Edit / delete / retry (MCP, Public API, or CLI)

| Operation | Allowed statuses | Notes |
| --- | --- | --- |
| Edit | `SCHEDULED`, `QUEUED`, `NEEDS_APPROVAL`, limited `PUBLISHED` | Published: FB/LinkedIn/YouTube/Mastodon content only. Recurring on edit only if status is `NEEDS_APPROVAL`. |
| Delete | All except `PROCESSING` | Published platform delete: FB, LI, X, YT, Pinterest, Bluesky, Mastodon, Threads (not IG/TikTok/GBP) |
| Retry | `FAILED` only | Async 202 |

### Schedule validation rules

| Schedule type | Constraint |
| --- | --- |
| `DRAFT` / `ONCE` | Must be in the future, within 12 months |
| `RECURRING_WEEKLY` | Max 3-month interval |
| `RECURRING_MONTHLY` | Max 12-month interval |
| `RECURRING_CUSTOM` | 1–25 dates |

Use IANA timezone strings (e.g. `America/New_York`, `Asia/Kolkata`) in all `schedule.details.timezone` fields.

### Profiles

Call MCP `list-profiles` (or CLI `profiles:list`) to discover projects, then pass optional MCP tool `profileId` (or CLI `--profile-id`) for a non-default profile in the same org. See [AUTHENTICATION.md](./AUTHENTICATION.md).

---

## Monitoring recommendations

| Signal | How to detect |
| --- | --- |
| Auth failures | `401`, `API_KEY_SCOPE_DENIED` in MCP client logs |
| Rate limiting | `429` with `MCP_*` error codes |
| Validation errors | MCP tool error text; i18n keys like `post.ScheduleFeature` |
| Post acceptance | `structuredContent.status === "accepted"` on `create-posts` |
| Post verification | `get-posts` with matching `publishAt` range and `status` filter |

Audit history is available in the Verlynk dashboard for state-changing operations.

---

## Incident response

| Issue | Action |
| --- | --- |
| Exposed MCP key | Rotate immediately — [SECURITY.md](./SECURITY.md) |
| Duplicate posts published | Review audit log; delete via Public API or dashboard |
| Wrong profile targeted | Confirm tool `profileId` / CLI `--profile-id`; must belong to default org |
| Connector down | Check [HOW_TO_CONNECT.md](./HOW_TO_CONNECT.md) troubleshooting |

**Support:** [SUPPORT.md](./SUPPORT.md)

---

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [SECURITY.md](./SECURITY.md)
- [MCP_TOOLS.md](./MCP_TOOLS.md)
- [FEATURES.md](./FEATURES.md)
