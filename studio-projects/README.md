# Studio projects

The web-studio bot team builds each site in its own folder here. Start a new project with:

```text
/studio landing page for <your brand or idea>
```

## Layout of a project

```
studio-projects/<slug>/
├── studio/                 handoff files between the bots
│   ├── brief.md            Creative Director: problem, audience, success criteria
│   ├── decisions.md        every decision and its reason
│   ├── research/           Designer: references and screenshots
│   ├── design/             Designer: directions, tokens, type, motion, layout spec, assets
│   ├── content/            Copywriter: voice, copy, metadata
│   └── qa/round-N.md       Critic: scores, gate result, defects
└── site/                   Builder: the Next.js app
```

## Running a finished site

```bash
cd studio-projects/<slug>/site && npm install && npm run dev
```

The team, its pipeline and its quality gate are described in [`docs/web-studio-bot-team.md`](../docs/web-studio-bot-team.md). The bot definitions live in `.claude/agents/` and `.claude/skills/`.
