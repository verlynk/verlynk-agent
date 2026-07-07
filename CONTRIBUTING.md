# Contributing

Thank you for helping improve Verlynk agent documentation.

## What belongs in this repo

| Include | Exclude |
| --- | --- |
| MCP tool reference for **live** tools | Dormant/unreleased features |
| Agent skill (`SKILL.md`) | Backend source code |
| JSON schemas for tool inputs | Secrets, internal URLs, env values |
| Example payloads and curl scripts | Full OpenAPI duplication |
| Setup templates for MCP clients | npm CLI packages |
| Public API endpoints and error codes | Internal file paths, DAO/service names, infra details |

## Source of truth

When updating tool documentation, verify behavior against the **private Verlynk backend MCP module** before merging. Compare input schemas, response field names, rate-limit codes, and auth requirements with the live server.

Verlynk maintainers: use internal engineering docs for backend file references.

## Making changes

1. Update the relevant markdown file(s) and JSON schemas
2. Update [CHANGELOG.md](./CHANGELOG.md) under `[Unreleased]` or a new version
3. Cross-check [FEATURES.md](./FEATURES.md) scope boundary
4. Ensure [skills/verlynk/SKILL.md](./skills/verlynk/SKILL.md) stays in sync with [MCP_TOOLS.md](./MCP_TOOLS.md)
5. Run the security checklist below
6. Submit a pull request with a clear description of what changed and why

## Style guide

- Use precise field names from API responses (`channelId`, not `id`)
- Document only verified behavior — no speculative features
- Include `errorCode` values where applicable
- Link to [docs.verlynk.com](https://docs.verlynk.com) instead of duplicating OpenAPI
- Keep agent-facing language concise and actionable

## Security checklist (required before merge)

This is a **public** repository. Confirm:

- [ ] No real API keys, JWTs, or `.env` values
- [ ] No internal file paths (`src/features/`, DAO/service names)
- [ ] No unreleased tool names or implementation state ("commented out", "disabled in server")
- [ ] No maintainer-local paths (`/Users/`, `localhost`, `ngrok`)
- [ ] No infra details (Redis, DB, queue names, AWS resource IDs)
- [ ] Only **live, publicly callable** API behavior is documented

## Syncing with verlynk-docs

Product docs live at [verlynk-docs](https://github.com/verlynk/verlynk-docs). After significant changes:

- Update `docs/integrations/agent-skills-repo.mdx` if the repo structure changes
- Ensure setup instructions in both repos do not contradict

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
