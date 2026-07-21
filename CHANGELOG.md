# Changelog

All notable changes to this documentation repo are listed here.

## [1.7.0] - 2026-07-21

### Added

- MCP tool parity with CLI: profiles (`list-profiles`, `get-profile`, create/update/delete), post lifecycle (`get-post`, `update-post`, `delete-post`, `retry-post`), drafts, inbox, analytics, validate, usage
- `create-posts` now accepts top-level `workflowId`, `labels`, and `campaign` (NEEDS_APPROVAL parity)
- Multi-profile discovery: agents call `list-profiles` then pass `profileId`; `list-channels` echoes `profileId` / `profileName`

### Changed

- [FEATURES.md](./FEATURES.md), [MCP_TOOLS.md](./MCP_TOOLS.md), [AUTHENTICATION.md](./AUTHENTICATION.md), [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md), [examples/EXAMPLES.md](./examples/EXAMPLES.md) updated for expanded MCP surface

## [1.6.0] - 2026-07-18

### Added

- Full post lifecycle docs for agents: draft, queue, recurring, needs-approval, edit, delete, retry
- Example payloads: `create-queue-post.json`, `create-recurring-*.json`, `create-needs-approval-post.json`, `create-publish-now-post.json`, `update-scheduled-post.json`, `update-draft-to-schedule.json`
- Docs site: expanded [CLI Posts](https://docs.verlynk.com/cli/posts) / Drafts, prompt examples, OpenAPI edit/delete/create narratives

### Fixed

- MCP **does** honor optional tool `profileId` — corrected [AUTHENTICATION.md](./AUTHENTICATION.md), [FEATURES.md](./FEATURES.md), [OPERATIONS.md](./OPERATIONS.md), skill
- Documented soft `SCHEDULE` × schedule-type pairing (202 with zero posts)
- Clarified edit/delete status matrices and published platform limits

## [1.5.0] - 2026-07-16

### Added

- npm CLI package bumped to **`verlynk@1.2.0`** — adds `inbox:list`, `inbox:reply`, `inbox:status`
- Inbox live via **Public API + CLI** (`/v1/inbox/*`, `inbox:list`\|`reply`\|`status`) — list/reply/triage comments and replies across connected channels; still **not available via MCP**
- [docs.verlynk.com/cli/inbox](https://docs.verlynk.com/cli/inbox): purpose, commands, JSON shapes, agent workflow, error codes
- CLI `--json` mode now prints structured `{ errorCode, message, retryable, action }` for inbox errors instead of free-form text

### Notes

- Inbox v1 covers **comments and replies only** — no DMs, mentions, or other engagement types yet
- `inboxStatus` (`OPEN`\|`FOLLOWUP`\|`CLOSED`) is a manual triage flag, not an "already replied" indicator
- Reply-to-reply is unsupported; reply to the top-level comment id instead

## [1.4.1] - 2026-07-16

### Changed

- npm CLI package bumped to **`verlynk@1.1.0`** (upgrade nudge; media already shipped in 1.0.1 under the `verlynk` name)
- Clarified that deprecated `@verlynk/cli@1.0.0` lacks `media:upload` — install `verlynk` instead

## [1.4.0] - 2026-07-16

### Changed

- npm package renamed from `@verlynk/cli` to `verlynk` (`npm install -g verlynk`)

### Added

- CLI `media:upload` and `posts:create --media-file` / `--media-id` for local image publishing
- Agent-first media docs: CLI vs MCP shapes in [MEDIA.md](./MEDIA.md), [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md)
- [`examples/create-image-post-cli.json`](./examples/create-image-post-cli.json) and [`schemas/public-api-post.media.json`](./schemas/public-api-post.media.json)
- Upload script completes media and returns `mediaId`

### Fixed

- Documented that Public API posts require `mediaId` (not MCP `mediaUrl`/`mimeType`)
- Broken `/api` → `/api-reference` links

## [1.3.0] - 2026-07-07

### Added

- Security checklist in [CONTRIBUTING.md](./CONTRIBUTING.md) for public-repo contributions
- CI workflow (`.github/workflows/validate.yml`) — JSON schema validation, example validation, sensitive-pattern scan
- `get-posts` key response fields table in [MCP_TOOLS.md](./MCP_TOOLS.md)
- `API_RATE_LIMIT_EXCEEDED` documented in [AUTHENTICATION.md](./AUTHENTICATION.md) and [OPERATIONS.md](./OPERATIONS.md)

### Fixed

- `channelId` description in `schemas/create-posts.input.json` (`channels[].channelId`, not `id`)
- `image/jpg` MIME mapping in `examples/upload-media.sh`
- [AUTHENTICATION.md](./AUTHENTICATION.md) Related section self-link
- [PUBLISHING.md](./PUBLISHING.md) maintainer-specific path

### Security

- Removed internal backend file paths from [CONTRIBUTING.md](./CONTRIBUTING.md)
- Generalized unreleased features in [FEATURES.md](./FEATURES.md) and [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md) — no tool names or implementation state

## [1.2.0] - 2026-07-07

### Added

- [OPERATIONS.md](./OPERATIONS.md) — production ops: retry, idempotency, plan limits, permissions
- [SUPPORT.md](./SUPPORT.md) — support channels and escalation guidance
- [CONTRIBUTING.md](./CONTRIBUTING.md) — documentation maintenance guide
- [config/README.md](./config/README.md) — config template usage

### Fixed

- Documented that `action: "DRAFT"` posts are **not** returned by `get-posts`
- Documented `get-posts` filters on `publishAt` (not `createdAt`)
- Documented channel permission requirements (Create + Publish)
- Documented free vs paid plan schedule type limits
- Fixed remaining `platform` → `platformName` references in PROVIDER_SETTINGS.md
- Added action/schedule pairing matrix
- Documented no server-side idempotency on `create-posts`
- Media presign billing plan requirement

## [1.1.0] - 2026-07-07

### Fixed

- Corrected `list-channels` response field names (`channelId`, `channelName`, `platformName`) to match backend
- Removed incorrect references to `list-channels` platform/query filters (not supported by the API)
- Documented default profile requirement and org alignment for MCP context
- Aligned `get-posts` date format docs with backend (`YYYY-MM-DD` or ISO 8601)
- Added TikTok `privacy` enum values from backend constants

### Added

- [AUTHENTICATION.md](./AUTHENTICATION.md) — API key vs OAuth, scopes, context, error codes
- [SECURITY.md](./SECURITY.md) — token handling, rotation, production safeguards
- [schemas/list-channels.input.json](./schemas/list-channels.input.json)
- MCP protocol details (stateless JSON-RPC POST, OIDC metadata URL)
- Rate limit `errorCode` values (`MCP_RATE_LIMIT_EXCEEDED`, `MCP_BURST_LIMIT_EXCEEDED`)
- Full presign MIME type list from backend
- Upload script HTTP status validation and additional video formats

## [1.0.0] - 2026-07-07

### Added

- Initial public release
- Documentation for 3 live MCP tools: `list-channels`, `create-posts`, `get-posts`
- Agent skill at `skills/verlynk/SKILL.md`
- MCP client config templates for Claude, Cursor, and generic clients
- Platform settings reference (`PROVIDER_SETTINGS.md`)
- Media upload guide via Public API presign (`MEDIA.md`)
- Example JSON payloads and workflow scripts
