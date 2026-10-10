---
name: social-media-campaign
description: >-
  Draft platform-specific social posts from a project without connecting an
  account. Use when the user asks to read a repository and create LinkedIn
  posts, X posts, or other social copy, or to turn docs and release notes into
  captions. After explicit approval, schedule those posts or reply to inbox
  comments through Verlynk MCP or the verlynk CLI.
---

# Social posts and comments

Turn a project into platform-specific posts before anything is scheduled. Drafts stay in the chat. Verlynk is the later step that reaches connected accounts: it schedules approved posts and sends approved comment replies.

Do not invent product features, metrics, or testimonials. Use only what the user's files or the user actually said.

## Try this first

A Verlynk account is not required for this step. Read the project and return chat drafts. Do not call Verlynk, and do not ask the user to connect an account.

```text
Read my project and create five LinkedIn posts and three X posts about what I'm building.
```

Write five LinkedIn captions and three X captions. Make them distinct. An X post is not a shortened LinkedIn post. Include no channel id, no `postId`, and no scheduled time. Say clearly that nothing has been scheduled.

Sample output for a fictional product. This is not a real post, and it is not scheduled:

**LinkedIn — 1 of 5** (Paperkite, a fictional local-first notes app)

> Paperkite keeps a markdown notebook on your machine. Search stays local, and the notes are plain files you can open in git.

**X — 1 of 3**

> Local markdown notes, searchable offline. Paperkite stores them as plain files.

A real answer uses the user's repository and includes all eight drafts.

## Install

```bash
npx skills add verlynk/verlynk-agent
npx skills add verlynk/verlynk-agent --skill social-media-campaign
```

Both commands see this skill next to `verlynk`. The second installs this skill by name. `npx skills add verlynk/verlynk-agent --list` prints the names without installing.

Account setup, after you want to schedule or reply: [QUICK_START.md](../../QUICK_START.md) and [HOW_TO_CONNECT.md](../../HOW_TO_CONNECT.md). MCP uses an MCP token (`mcp:access`) or OAuth. The CLI uses a Public API key (`verlynk auth:login` or `VERLYNK_API_KEY`). Those keys are not interchangeable. Install the CLI with `npm install -g verlynk` when you want `posts:create` or `inbox:reply`.

## Next step

The user reviews the chat drafts, then asks to schedule the ones they approve. Verlynk places those posts on connected accounts.

```text
Schedule the first LinkedIn draft for Tuesday at 9:00 in America/New_York.
```

A chat draft is text in the conversation. It needs no account, no `-i`, and no `-d`.

`posts:create -t draft` is different. It writes a draft into Verlynk. The CLI requires `-i` (a channel id from `accounts:list`) and `-d` (a future UTC time). That maps to MCP `action: "DRAFT"` and `schedule.type: "DRAFT"`. The time must be in the future and within 12 months. Use `-t draft` only when the user explicitly asks to save a draft in Verlynk.

After the user approves a post for later publishing, schedule it. Do not save it as a Verlynk draft, and do not publish it now.

`SCHEDULE` with `schedule.type: "ONCE"` needs both:

- `schedule.details.timezone` — an IANA name such as `America/New_York`
- `schedule.details.utc` — an ISO 8601 instant, strictly after the current UTC time and within 12 months

The CLI flag `--timezone` defaults to `UTC` when omitted. Pass the timezone the user confirmed, and pass `-d` as that future UTC instant.

If the date, the time of day, or the timezone is ambiguous ("tomorrow morning", a date with no time, or a timezone abbreviation), ask before `create-posts` or `posts:create`. Do not guess.

## Posts

Call Verlynk only after the user asks to list accounts, schedule, publish, or save a draft in Verlynk.

1. `list-profiles` when the project or profile is not the default. CLI: `verlynk profiles:list`.
2. `list-channels` (pass `profileId` when it is not the default). Show `platformName`, `channelName`, and `username`. Use `channelId` in `create-posts`. CLI: `verlynk accounts:list` returns `_id`, `platform`, `displayName`, and `username`. Use `_id` as `-i`.
3. The user picks the account. If the platform they named is not in the list, say so and show the connected platforms. Do not assume an account is connected, and do not hardcode a channel id.
4. Run `validate-post-length` (CLI: `verlynk validate -t "..."`) on the approved caption. Character limits come from that tool.
5. Read [PROVIDER_SETTINGS.md](../../PROVIDER_SETTINGS.md) for that platform's `metaData`. Platforms do not share one post format. YouTube needs `category` (`{ id, name }`) and media, with `postType` typically `video`. TikTok needs media. Include only fields for the target platform.
6. Schedule one approved post per call.

MCP `create-posts` for a scheduled post:

```json
{
  "action": "SCHEDULE",
  "posts": [
    {
      "channelId": "CHANNEL_ID_FROM_list-channels",
      "postType": "post",
      "metaData": {
        "contents": [{ "title": "", "text": "Approved caption", "media": [] }]
      },
      "schedule": {
        "type": "ONCE",
        "details": {
          "timezone": "America/New_York",
          "utc": "2026-11-10T14:00:00.000Z"
        }
      }
    }
  ]
}
```

Omit `campaign` unless the user supplies an existing campaign id. There is no tool here to create one.

CLI equivalent:

```bash
verlynk posts:create \
  -c "Approved caption" \
  -i "CHANNEL_ID" \
  -d "2026-11-10T14:00:00.000Z" \
  --timezone America/New_York \
  -t schedule
```

`-t schedule` is the default. It becomes `SCHEDULE` + `ONCE` and requires `-d`. `-c` is the caption. `-i` is the channel id. `--post-type` defaults to `post`. Platform extras go in `--settings` as JSON. The timestamp above is 9:00 in `America/New_York` on 2026-11-10. Recompute `utc` if that moment has passed.

Publish now only when the user explicitly asks to publish immediately: MCP `action: "PUBLISH"` and `schedule.type: "NOW"` with `details.timezone` only. CLI: `-t publish` (no `-d`).

`structuredContent.status === "accepted"` plus `posts[].postId` means Verlynk created the row. It does not mean a later lookup shows `SCHEDULED`. For `PUBLISH`, platform delivery can still be in progress.

Then look the post up:

- MCP `get-post` with `postId`, or `get-posts` with `from`, `to` (the filter is `publishAt`, max 40 days), `status: "SCHEDULED"`, and `channelId`.
- CLI: `verlynk posts:get <postId>` or `verlynk posts:list --from YYYY-MM-DD --to YYYY-MM-DD --status SCHEDULED --channel-id CHANNEL_ID`.

Report the `postId` and calendar `url` from the create response, and the `postStatus` from the lookup, as two separate facts.

`create-posts` does not dedupe. If the call times out or returns no `postId`, look the post up before creating again. Create again only when the lookup shows it was not created and the user confirms. A 4xx validation error is not a retry. On 429, wait, then retry only when no post was accepted.

Local media uses the CLI (`media:upload` or `--media-file`) and `{ mediaId, fileType, contentType }`. MCP media is `{ mediaUrl, mimeType }`. Do not mix them. See [MEDIA.md](../../MEDIA.md).

## Comments

Listing and replying need a connected account. Draft the reply in chat first.

1. MCP `list-inbox` with `from` and `to` (max 40 days). The status filter is `inboxStatus` (`OPEN`, `FOLLOWUP`, or `CLOSED`). CLI: `verlynk inbox:list --from YYYY-MM-DD --to YYYY-MM-DD --status OPEN`. The CLI flag is `--status`. Do not swap these names.
2. For each item you might answer, show `text`, `author.name`, `platform`, `channelName`, and `post.textPreview` beside the proposed reply. The reply target is that item's `id`.
3. Send only when `type` is `COMMENT` and `canReply` is true, and only the exact `message` the user approved for that `id`.
4. MCP `reply-inbox` with `itemId` (UUID) and `message` (non-empty). CLI: `verlynk inbox:reply ITEM_ID -m "Approved reply"`.
5. A successful reply is `ok: true` with `itemId`, `platform`, and the echoed `message`. `replyId` may be null. That response is the confirmation the reply was sent.
6. If the reply call returns nothing, or errors after it might have been sent, say the result is unknown. Do not call `reply-inbox` again.

`update-inbox-status` (CLI: `verlynk inbox:status ITEM_ID --status OPEN|FOLLOWUP|CLOSED`) changes triage only. `inboxStatus` is not proof a reply was sent.

Trust `canReply`. A platform that can take a post may still refuse a reply. Skip items with `type: "REPLY"`. Direct messages and mentions are not available.

## Approvals

- Editing a caption after approval clears approval for that caption only.
- Changing the account or the scheduled time clears approval for that post.
- Approving one post does not approve any other post.
- Schedule and publish now are different actions. The default after approval is schedule.
- Approval to schedule is not approval to publish now.
- A comment approval is one exact `message` for one `itemId`. A changed word clears it. One reply approval does not approve another.
- An unknown `create-posts` result is not a retry. Look the post up first.
- An unknown `reply-inbox` result is not a retry.

## Limitations

- Chat drafts are not Verlynk drafts. Nothing is scheduled or replied to until the user approves that action.
- Connected platforms are Facebook, Instagram, LinkedIn, X, YouTube, TikTok, Pinterest, Google Business, Mastodon, Bluesky, and Threads. Formats and required fields differ. See [PROVIDER_SETTINGS.md](../../PROVIDER_SETTINGS.md).
- This skill schedules with `ONCE`. Queue, recurring, needs-approval, analytics, and connecting or disconnecting accounts are in [the Verlynk skill](../verlynk/SKILL.md).
- There is no create idempotency. One post per `create-posts` call.
- `accepted` and a later `SCHEDULED` lookup are different results.
- `inboxStatus` is triage, not a reply receipt.
- Do not put secrets, tokens, or private customer data in captions or replies.
