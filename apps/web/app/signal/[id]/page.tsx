import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { PriorityBadge } from "@/components/PriorityBadge";
import { OwnerBadge } from "@/components/OwnerBadge";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { CopyButton } from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export default async function SignalDetail({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const s = await api.signal(id).catch(() => null);
  if (!s) notFound();
  const runId = id.includes(":") ? id.split(":")[0] : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <article className="space-y-8">
        <header>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:underline">
            ← back to dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-2">{s.account_name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <PriorityBadge band={s.priority_band} />
            <OwnerBadge owner={s.recommended_action_owner} />
            <span className="text-xs text-gray-500 self-center">
              missing: <span className="text-gray-200">{s.missing_use_case || "—"}</span>
            </span>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3 text-center">
          <div className="border border-white/10 rounded p-3">
            <div className="text-xs uppercase text-gray-500">Priority level</div>
            <div className="text-lg font-semibold capitalize">{s.priority_band || "—"}</div>
          </div>
          <div className="border border-white/10 rounded p-3">
            <div className="text-xs uppercase text-gray-500">Confidence</div>
            <div className="text-lg font-semibold">{s.confidence?.toFixed(2) ?? "—"}</div>
          </div>
          <div className="border border-white/10 rounded p-3">
            <div className="text-xs uppercase text-gray-500">Final score</div>
            <div className="text-lg font-semibold">{s.final_score?.toFixed(2) ?? "—"}</div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">1 · Why now</h2>
          <p className="text-gray-100 leading-relaxed">{s.why_now || "—"}</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">2 · What's missing</h2>
          <p className="text-gray-100 leading-relaxed">{s.whats_missing || "—"}</p>
        </section>

        {s.who_to_target?.primary && (
          <section>
            <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">
              3 · Who to target
            </h2>
            <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-5">
              <div className="text-xs uppercase text-emerald-300 mb-1">Best persona</div>
              <div className="text-xl font-bold">
                {s.who_to_target.primary.name}
              </div>
              <div className="text-gray-300">{s.who_to_target.primary.title}</div>
              <div className="flex gap-3 text-xs text-gray-400 mt-2">
                <span>
                  <span className="text-gray-500">Buying role:</span>{" "}
                  <span className="font-semibold text-gray-200 capitalize">
                    {s.who_to_target.primary.buying_role.replace("_", " ")}
                  </span>
                </span>
                <span>
                  <span className="text-gray-500">Source:</span>{" "}
                  <span className="font-semibold text-gray-200 uppercase">
                    {s.who_to_target.primary.source}
                  </span>
                </span>
                {s.who_to_target.primary.linkedin && (
                  <a
                    href={s.who_to_target.primary.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
              <p className="text-sm mt-3 text-gray-200">
                <span className="text-gray-500">Why this person: </span>
                {s.who_to_target.primary.why_this_person}
              </p>
            </div>
            {s.who_to_target.secondary && (
              <div className="border border-white/10 rounded-lg p-4 mt-3">
                <div className="text-xs uppercase text-gray-500 mb-1">Secondary</div>
                <div className="font-semibold">{s.who_to_target.secondary.name}</div>
                <div className="text-sm text-gray-400">{s.who_to_target.secondary.title}</div>
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">
            4 · Supporting context
          </h2>
          <ul className="list-disc pl-6 text-sm space-y-1.5 text-gray-200">
            {(s.supporting_context || []).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>

        {s.draft_outreach && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold uppercase text-gray-400">
                5 · Draft outreach email
              </h2>
              <CopyButton
                text={`Subject: ${s.draft_outreach.subject}\n\n${s.draft_outreach.body}`}
              />
            </div>
            <div className="border border-blue-500/30 bg-blue-500/5 rounded-lg overflow-hidden">
              <div className="bg-blue-500/10 px-4 py-2 border-b border-blue-500/20 text-sm">
                <span className="text-gray-500 text-xs uppercase">Subject:</span>{" "}
                <span className="font-semibold text-gray-100">
                  {s.draft_outreach.subject}
                </span>
              </div>
              {s.who_to_target?.primary && (
                <div className="bg-black/30 px-4 py-1.5 border-b border-blue-500/20 text-xs text-gray-400">
                  <span className="text-gray-500">To:</span> {s.who_to_target.primary.name}
                  {s.who_to_target.primary.title && (
                    <span className="text-gray-500"> · {s.who_to_target.primary.title}</span>
                  )}
                </div>
              )}
              <div className="px-4 py-4 font-mono text-sm whitespace-pre-wrap bg-black/40 text-gray-100">
                {s.draft_outreach.body}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click <span className="font-mono">Copy</span> above to paste this into your email client.
            </p>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">
            Agent reasoning trace
          </h2>
          <p className="text-sm text-gray-400 italic border-l-2 border-white/20 pl-3">
            {s.reasoning_trace}
          </p>
        </section>

        <section>
          <FeedbackButtons signalId={s.id} runId={runId} />
        </section>
      </article>

      <aside className="lg:sticky lg:top-6 space-y-4 self-start">
        <div className="border border-white/10 rounded p-4 space-y-3">
          <div>
            <div className="text-xs uppercase text-gray-500">Confidence</div>
            <div className="font-mono text-lg">{s.confidence?.toFixed(2) ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Final score</div>
            <div className="font-mono text-lg">{s.final_score?.toFixed(2) ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">AE</div>
            <div>
              {s.ownership?.ae?.name || "—"}{" "}
              <span className="text-xs text-gray-500">{s.ownership?.ae?.role}</span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">CSM</div>
            <div>{s.ownership?.csm?.name || "—"}</div>
          </div>
        </div>
        <Link
          href={`/accounts/${s.account_id}`}
          className="block text-center border border-white/10 rounded px-3 py-2 text-sm hover:bg-white/5"
        >
          View account context →
        </Link>
      </aside>
    </div>
  );
}
