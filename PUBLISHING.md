# Publishing

Instructions for publishing this repo to GitHub.

## Prerequisites

- GitHub org access to `verlynk`
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated

## Create and push

From this directory:

```bash
cd /Users/geoffrey/Developer/verlynk-agent

# Create public repo and push (first time)
gh repo create verlynk/verlynk-agent \
  --public \
  --source=. \
  --remote=origin \
  --description "Agent documentation and skills for the Verlynk MCP server" \
  --push
```

## Add repository topics

```bash
gh repo edit verlynk/verlynk-agent \
  --add-topic mcp \
  --add-topic agent-skills \
  --add-topic social-media \
  --add-topic verlynk \
  --add-topic claude \
  --add-topic cursor
```

## Verify skill install

After the repo is public:

```bash
npx skills add verlynk/verlynk-agent
```

## Subsequent releases

1. Update [CHANGELOG.md](./CHANGELOG.md)
2. Commit and push to `main`

```bash
git add -A
git commit -m "Describe your changes"
git push origin main
```

## Related docs updates

Cross-links are in [verlynk-docs](https://github.com/verlynk/verlynk-docs):

- `docs/integrations/agent-skills-repo.mdx`
- `docs/getting-started/introduction.mdx`
- `docs/getting-started/create-mcp-token.mdx`
