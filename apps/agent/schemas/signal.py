"""Signal — the structured output the reasoning agent emits per account.

Schema is enforced via Pydantic validation on every Claude response. JSON-mode
guarantees JSON; this enforces shape. Mirrors §7 of the build spec.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

MissingUseCase = Literal["Webinar", "Field Events", "Third-Party Events", "Conferences"]
PriorityBand = Literal["high", "medium", "low"]
ActionOwner = Literal["AE", "CSM", "BOTH"]
BuyingRole = Literal["economic_buyer", "champion", "influencer", "user"]
ContactSource = Literal["sf", "clay"]


class SignalOwner(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: Optional[str] = None
    role: Optional[str] = None


class SignalOwnership(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ae: SignalOwner = Field(default_factory=SignalOwner)
    csm: SignalOwner = Field(default_factory=SignalOwner)


class TargetPersona(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    title: str
    buying_role: BuyingRole
    source: ContactSource
    linkedin: Optional[str] = None
    why_this_person: str


class WhoToTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")
    primary: TargetPersona
    secondary: Optional[TargetPersona] = None


class DraftOutreach(BaseModel):
    model_config = ConfigDict(extra="forbid")
    subject: str
    body: str


class ModelMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")
    model: str = ""
    tokens_in: int = 0
    tokens_out: int = 0
    latency_ms: int = 0


class Signal(BaseModel):
    """Reasoning agent output.

    When ``is_signal=false`` only ``account_id``, ``account_name``, ``is_signal``,
    and ``reasoning_trace`` are required (everything else is optional).
    """

    model_config = ConfigDict(extra="forbid")

    # Required always
    account_id: str
    account_name: str
    is_signal: bool
    reasoning_trace: str

    # Required when is_signal=true
    missing_use_case: Optional[MissingUseCase] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    priority_band: Optional[PriorityBand] = None
    recommended_action_owner: Optional[ActionOwner] = None
    ownership: Optional[SignalOwnership] = None
    why_now: Optional[str] = None
    whats_missing: Optional[str] = None
    who_to_target: Optional[WhoToTarget] = None
    supporting_context: Optional[list[str]] = None
    draft_outreach: Optional[DraftOutreach] = None

    # Orchestrator-computed (not Claude). Settable post-hoc.
    priority_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    final_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    # Bookkeeping
    model_metadata: ModelMetadata = Field(default_factory=ModelMetadata)
    pii_present: bool = False
    data_quality_flag: Optional[str] = None

    @model_validator(mode="after")
    def _require_fields_when_signal(self) -> "Signal":
        if self.is_signal:
            missing = [
                name
                for name, value in (
                    ("missing_use_case", self.missing_use_case),
                    ("confidence", self.confidence),
                    ("priority_band", self.priority_band),
                    ("recommended_action_owner", self.recommended_action_owner),
                    ("why_now", self.why_now),
                    ("whats_missing", self.whats_missing),
                    ("who_to_target", self.who_to_target),
                    ("supporting_context", self.supporting_context),
                    ("draft_outreach", self.draft_outreach),
                )
                if value is None
            ]
            if missing:
                raise ValueError(
                    f"is_signal=true requires fields: {', '.join(missing)}"
                )
        return self
