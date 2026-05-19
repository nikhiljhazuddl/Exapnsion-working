import { redirect } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { readSession } from "@/lib/session";
import { SignalCard } from "@/components/SignalCard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = readSession();
  if (!session.user || !session.role) redirect("/login");

  if (session.role === "RevOps" || session.role === "Admin") {
    const [summary, signalsRes] = await Promise.all([
      api.runsLatest().catch(() => null),
      api.signals(session.role).catch(() => ({ signals: [] })),
    ]);
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">RevOps overview</h1>
        {summary && (
          <section>
            <h2 className="font-semibold mb-3">Latest run · {summary.run_id}</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(summary.funnel).map(([k, v]) => (
                <div key={k} className="border border-white/10 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">{k}</div>
                  <div className="text-2xl font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold mb-2">Disqualifier breakdown</h3>
                <ul className="text-sm space-y-1">
                  {Object.entries(summary.dq_breakdown).map(([k, v]) => (
                    <li key={k} className="flex justify-between border-b border-white/5 py-1">
                      <span>{k}</span>
                      <span className="font-mono">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Queue depth</h3>
                <div className="text-sm space-y-1">
                  <div className="text-gray-500 text-xs uppercase">By AE</div>
                  {Object.entries(summary.queues.by_ae).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-white/5 py-1">
                      <span>{k}</span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                  <div className="text-gray-500 text-xs uppercase mt-3">By CSM</div>
                  {Object.entries(summary.queues.by_csm).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-white/5 py-1">
                      <span>{k}</span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        <section>
          <h2 className="font-semibold mb-3">All signals ({signalsRes.signals.length})</h2>
          <div className="space-y-3">
            {signalsRes.signals.length === 0 && (
              <p className="text-sm text-gray-500">
                No signals yet. Run <code>make agent-run</code> with{" "}
                <code>ANTHROPIC_API_KEY</code> set to generate them.
              </p>
            )}
            {signalsRes.signals.map((s) => (
              <SignalCard key={s.id} signal={s} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // AE / CSM view
  const { signals } = await api.signals(session.role, session.user);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome, {session.user} <span className="text-gray-500 text-base">({session.role})</span>
      </h1>
      <p className="text-sm text-gray-400">
        Top expansion signals for the week. {" "}
        <Link href="/notifications" className="underline">
          See dropped accounts
        </Link>
        .
      </p>
      <div className="space-y-3">
        {signals.length === 0 && (
          <p className="text-sm text-gray-500">
            No active signals in your queue. (After <code>make agent-run</code> populates them,
            you'll see up to 5 here.)
          </p>
        )}
        {signals.map((s) => (
          <SignalCard key={s.id} signal={s} />
        ))}
      </div>
    </div>
  );
}
