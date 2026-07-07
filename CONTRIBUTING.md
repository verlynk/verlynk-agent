# Contributing

Thank you for helping improve Verlynk agent documentation.

## What belongs in this repo

| Include | Exclude |
| --- | --- |
| MCP tool reference for **live** tools | Dormant/unreleased backend features |
| Agent skill (`SKILL.md`) | Backend source code |
| JSON schemas derived from backend Zod/Joi | Secrets, internal URLs, env values |
| Example payloads and curl scripts | Full OpenAPI duplication |
| Setup templates for MCP clients | npm CLI packages |

## Source of truth

When updating tool documentation, verify against the Verlynk backend:

| Topic | Backend path |
| --- | --- |
| MCP tools | `src/features/mcp/tools/` |
| Input schemas | `src/features/mcp/mcpSchema.ts` |
| Auth | `src/features/mcp/mcpService.ts`, `mcpContext.ts` |
| Rate limits | `src/features/mcp/mcpRateLimiter.ts` |
| Post validation | `src/features/post/services/validatePostService.ts` |
| Channel list | `src/features/social/socialDao.ts` → `getAllSocialProfilesByUserDao` |
| Media presign | `src/features/publicV1/media/` |

## Making changes

1. Update the relevant markdown file(s) and JSON schemas
2. Update [CHANGELOG.md](./CHANGELOG.md) under `[Unreleased]` or a new version
3. Cross-check [FEATURES.md](./FEATURES.md) scope boundary
4. Ensure [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md) stays in sync with [MCP_TOOLS.md](./MCP_TOOLS.md)
5. Submit a pull request with a clear description of what changed and why

## Style guide

- Use precise field names from API responses (`channelId`, not `id`)
- Document only verified behavior — no speculative features
- Include `errorCode` values where applicable
- Link to [docs.verlynk.com](https://docs.verlynk.com) instead of duplicating OpenAPI
- Keep agent-facing language concise and actionable

## Syncing with verlynk-docs

Product docs live at [verlynk-docs](https://github.com/verlynk/verlynk-docs). After significant changes:

- Update `docs/integrations/agent-skills-repo.mdx` if the repo structure changes
- Ensure setup instructions in both repos do not contradict

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
