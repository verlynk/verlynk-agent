# Provider Settings

Platform-specific fields for the `create-posts` MCP tool.

These fields go inside `metaData` on each post object. **Only include fields relevant to the target platform** — omit unrelated fields to avoid validation errors.

General rule: call `list-channels` first, check `channels[].platformName`, then include only the matching section below.

---

## All platforms

### `metaData.contents[]`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Used by YouTube, Pinterest, and others |
| `text` | string | Post body / caption |
| `media` | array | `{ mediaUrl, mimeType }` — upload via [MEDIA.md](./MEDIA.md) first |

### `metaData.firstComment`

| Field | Type | Notes |
| --- | --- | --- |
| `firstComment` | string | **Not available** for Mastodon, Bluesky, Threads, Pinterest |

### `metaData.link`

| Field | Type | Notes |
| --- | --- | --- |
| `link` | string | Optional link attachment |

---

## YouTube

Include only when `platformName` is `youtube`.

| Field | Type | Description |
| --- | --- | --- |
| `category` | `{ id, name }` | Video category |
| `privacy` | string | Privacy setting |
| `license` | string | Video license |
| `embedding` | boolean | Allow embedding |
| `notifySubscribers` | boolean | Notify subscribers on publish |
| `paidPromotions` | boolean | Contains paid promotion |
| `playlist` | `{ id, name }` | Target playlist |
| `madeForKids` | boolean | Made for kids |
| `tags` | string[] | Video tags |

**`postType`:** typically `video`

**Media:** required — upload video via [MEDIA.md](./MEDIA.md)

Example: [`examples/create-youtube-post.json`](./examples/create-youtube-post.json)

---

## TikTok

Include only when `platformName` is `tiktok`.

| Field | Type | Description |
| --- | --- | --- |
| `privacy` | string | `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, `FOLLOWER_OF_CREATOR`, `SELF_ONLY` |
| `publishAsDraft` | boolean | Save as draft on TikTok |
| `disableComment` | boolean | Disable comments |
| `disableDuet` | boolean | Disable duet |
| `disableStitch` | boolean | Disable stitch |
| `videoCoverTimestampMs` | number | Cover frame timestamp (ms) |
| `isAigc` | boolean | AI-generated content flag |
| `autoAddMusic` | boolean | Auto-add music |
| `brandOrganicToggle` | boolean | Brand organic content |
| `brandContentToggle` | boolean | Branded content |

**`postType`:** typically `video` or `reel`

**Media:** required — TikTok requires a trusted media URL. Upload via [MEDIA.md](./MEDIA.md).

Example: [`examples/create-tiktok-post.json`](./examples/create-tiktok-post.json)

---

## X (Twitter)

Include only when `platformName` is `x`.

| Field | Type | Description |
| --- | --- | --- |
| `enableDirectMessaging` | boolean | Enable DM from post |
| `replySettings` | string | Who can reply: `everyone`, `following`, `mentionedUsers`, `subscribers` |

**`postType`:** `post` or `thread`

For threads, use multiple content blocks or multiple posts in the `posts` array.

---

## Pinterest

Include only when `platformName` is `pinterest`.

| Field | Type | Description |
| --- | --- | --- |
| `board` | `{ id, name }` | Target board |
| `dominantColor` | string | Dominant color hex |
| `altText` | string | Image alt text |
| `boardSectionId` | string | Board section ID |
| `privateNote` | string | Private note |

**`postType`:** typically `pin`

**Note:** `firstComment` is not supported on Pinterest.

---

## Mastodon

Include only when `platformName` is `mastodon`.

| Field | Type | Description |
| --- | --- | --- |
| `isSensitive` | boolean | Mark as sensitive content |
| `spoilerText` | string | Content warning text (max 500 chars) |
| `visibility` | string | `public`, `unlisted`, `private`, `direct` |

**Note:** `firstComment` is not supported on Mastodon.

---

## Platforms without extra MCP fields

These platforms use `metaData.contents` (text, title, media) without additional MCP-specific fields:

| Platform | `platformName` | Common `postType` |
| --- | --- | --- |
| Facebook | `facebook` | `post`, `reel`, `story` |
| Instagram | `instagram` | `post`, `reel`, `story` |
| LinkedIn | `linkedin` | `post` |
| Google Business | `google_business` | `post`, `offer`, `event` |
| Bluesky | `bluesky` | `post` |
| Threads | `threads` | `post`, `thread` |

**Note:** `firstComment` is not supported on Bluesky or Threads.

---

## Post types

| Value | Typical use |
| --- | --- |
| `post` | Standard feed post |
| `reel` | Short-form video |
| `story` | Ephemeral story |
| `video` | Long-form video (YouTube) |
| `thread` | Multi-part thread (X, Threads) |
| `pin` | Pinterest pin |
| `offer` | Google Business offer |
| `event` | Google Business event |

---

## Actions (`action` field)

| Value | Behavior |
| --- | --- |
| `DRAFT` | Save as draft (stored separately — **not** returned by `get-posts`) |
| `SCHEDULE` | Schedule for future publish |
| `PUBLISH` | Publish immediately (use `schedule.type: "NOW"`) |
| `QUEUE` | Add to publishing queue (`schedule.type: "QUEUE"`) |
| `NEEDS_APPROVAL` | Submit for workflow approval |

## Action and schedule pairing

| `action` | Required `schedule.type` | Notes |
| --- | --- | --- |
| `DRAFT` | `DRAFT` | Draft `utc` must be future, within 12 months |
| `PUBLISH` | `NOW` | Immediate publish |
| `SCHEDULE` | `ONCE`, `RECURRING_*` | `ONCE` requires future `utc` |
| `QUEUE` | `QUEUE` | `queueType`: `NEXT` or `LAST` |
| `NEEDS_APPROVAL` | Per workflow | Requires workflow configuration on channel |

Free plans support only `NOW`, `ONCE`, and `DRAFT` schedule types. See [OPERATIONS.md](./OPERATIONS.md).

---

## Related

- [MCP_TOOLS.md](./MCP_TOOLS.md)
- [examples/](./examples/)
- [docs.verlynk.com](https://docs.verlynk.com)
