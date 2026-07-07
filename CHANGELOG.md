# Changelog

All notable changes to this documentation repo are listed here.

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
