# GTM Mesh — Expansion Agent V1

Local monorepo build of Zuddl's Expansion Agent — the first Use Case Agent in the GTM Mesh Revenue Agentic System.

**Single source of truth:** [docs/Expansion_Agent_V1_Build_Spec.md](docs/Expansion_Agent_V1_Build_Spec.md)

## Layout

```
apps/agent/   Python 3.11 + LangGraph + Anthropic SDK   (uv)
apps/api/     FastAPI                                    (uv)
apps/web/     Next.js 14 + Tailwind + shadcn/ui          (pnpm)
data/         Expansion_Agent_1.xlsx (static, 117 accounts)
docs/         Spec + reference material
```

## Quick start

```bash
cp .env.example .env             # add ANTHROPIC_API_KEY
make agent-dry                   # filter + rank, no LLM
make agent-run                   # full run, ~44 LLM calls
make dev                         # API on :8000, web on :3000
```

See [RUN.md](RUN.md) (generated in Phase 13) for full operator instructions.

## Build phases

The build proceeds in 13 phases (scaffold → schemas → repository → filter → rank → context → reasoning → graph → persist → CLI → API → web → e2e → docs). Each phase has a hard gate; the funnel test in Phase 3 is non-negotiable: **117 → 104 → 77 → 54 → 48 → 46 → 44**.
# Exapnsion-working
