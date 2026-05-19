import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Notifications() {
  const session = readSession();
  if (!session.user || !session.role) redirect("/login");

  const { notifications } =
    session.role === "RevOps" || session.role === "Admin"
      ? await api.notifications()
      : await api.notifications(session.role, session.user);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-gray-400">
        Accounts where a gap was detected but the agent did not surface a signal. Transparency
        log — see the reason and investigate.
      </p>
      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Account</th>
              <th className="px-4 py-2">Gap</th>
              <th className="px-4 py-2">Rule</th>
              <th className="px-4 py-2">Explanation</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-500" colSpan={5}>
                  No notifications.
                </td>
              </tr>
            )}
            {notifications.map((n, i) => (
              <tr key={`${n.account_id}-${i}`} className="border-t border-white/5">
                <td className="px-4 py-2">{n.account_name}</td>
                <td className="px-4 py-2 text-gray-300">{n.detected_gap}</td>
                <td className="px-4 py-2 font-mono text-xs">{n.disqualifier_rule}</td>
                <td className="px-4 py-2 text-gray-400">{n.explanation}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/accounts/${n.account_id}`}
                    className="text-xs underline text-blue-400"
                  >
                    Investigate
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
