# Changelog

All notable changes to this documentation repo are listed here.

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
