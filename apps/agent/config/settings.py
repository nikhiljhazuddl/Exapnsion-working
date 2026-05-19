"""Runtime configuration. Loaded from environment with .env fallback."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# load .env if present (apps/agent/.env or repo-root .env)
_HERE = Path(__file__).resolve().parent.parent  # apps/agent
load_dotenv(_HERE / ".env")
load_dotenv(_HERE.parent.parent / ".env")


@dataclass(frozen=True)
class Settings:
    llm_provider: str  # "anthropic" | "openai"
    anthropic_api_key: str
    openai_api_key: str
    model: str
    run_cost_cap_usd: float
    max_concurrency: int
    data_xlsx_path: Path
    run_log_dir: Path
    output_dir: Path


def _path(env_key: str, default: Path) -> Path:
    value = os.environ.get(env_key)
    if not value:
        return default
    p = Path(value)
    return p if p.is_absolute() else (_HERE / p).resolve()


def get_settings() -> Settings:
    provider = os.environ.get("LLM_PROVIDER", "anthropic").strip().casefold()
    if provider not in {"anthropic", "openai"}:
        raise ValueError(f"LLM_PROVIDER must be 'anthropic' or 'openai', got {provider!r}")
    # Pick a sensible default model per provider unless MODEL is explicitly set.
    default_model = "claude-opus-4-7" if provider == "anthropic" else "gpt-4o-mini"
    return Settings(
        llm_provider=provider,
        anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
        openai_api_key=os.environ.get("OPENAI_API_KEY", ""),
        model=os.environ.get("MODEL", default_model),
        run_cost_cap_usd=float(os.environ.get("RUN_COST_CAP_USD", "5")),
        max_concurrency=int(os.environ.get("MAX_CONCURRENCY", "8")),
        data_xlsx_path=_path(
            "DATA_XLSX_PATH", (_HERE.parent.parent / "data" / "Expansion_Agent_1.xlsx").resolve()
        ),
        run_log_dir=(_HERE / "run_log").resolve(),
        output_dir=(_HERE / "output").resolve(),
    )
