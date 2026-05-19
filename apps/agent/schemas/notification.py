"""Notification — the transparency-log entry written every time an account is
detected as having a gap but is dropped by a disqualifier.

Routes to BOTH the AE and the CSM. Mirrors §7 of the build spec.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict

DisqualifierRule = Literal[
    "DQ1_red_adoption",
    "DQ2_recent_activity",
    "DQ3_named_open_opp",
    "DQ4_open_opp_flag",
    "DQ5_inactive",
]


class Notification(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_id: str
    account_name: str
    ae: Optional[str] = None
    csm: Optional[str] = None
    detected_gap: str
    disqualifier_rule: DisqualifierRule
    explanation: str
    want_more_info: bool = True
