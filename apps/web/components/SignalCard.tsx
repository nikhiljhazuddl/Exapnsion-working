import Link from "next/link";
import type { Signal } from "@/lib/api";
import { PriorityBadge } from "./PriorityBadge";
import { OwnerBadge } from "./OwnerBadge";

export function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Link
      href={`/signal/${encodeURIComponent(signal.id)}`}
      className="block border border-white/10 rounded-lg p-4 hover:border-white/30 transition"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{signal.account_name}</h3>
        <div className="flex gap-2">
          <PriorityBadge band={signal.priority_band} />
          <OwnerBadge owner={signal.recommended_action_owner} />
        </div>
      </div>
      <div className="text-sm text-gray-400 mb-2">
        Missing: <span className="text-gray-200">{signal.missing_use_case || "—"}</span>
      </div>
      <p className="text-sm text-gray-300 line-clamp-3">{signal.why_now || ""}</p>
      <div className="text-xs text-gray-500 mt-3">
        score {signal.final_score?.toFixed(2) ?? "—"} · AE{" "}
        {signal.ownership?.ae?.name || "?"} · CSM {signal.ownership?.csm?.name || "?"}
      </div>
    </Link>
  );
}
