import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE || "http://localhost:8000";

async function get<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = cookies().get("session")?.value;
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(session ? { cookie: `session=${session}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type UsersResponse = {
  roles: string[];
  users: { role: string; name: string }[];
};
export type RunSummary = {
  run_id: string;
  triggered_at: string;
  funnel: Record<string, number>;
  dq_breakdown: Record<string, number>;
  queues: { by_ae: Record<string, number>; by_csm: Record<string, number> };
};
export type Signal = {
  id: string;
  account_id: string;
  account_name: string;
  is_signal: boolean;
  missing_use_case?: string;
  priority_band?: "high" | "medium" | "low";
  confidence?: number;
  final_score?: number;
  recommended_action_owner?: "AE" | "CSM" | "BOTH";
  ownership?: {
    ae?: { name?: string; role?: string };
    csm?: { name?: string };
  };
  why_now?: string;
  whats_missing?: string;
  who_to_target?: {
    primary: {
      name: string;
      title: string;
      buying_role: string;
      source: "sf" | "clay";
      linkedin?: string | null;
      why_this_person: string;
    };
    secondary?: any;
  };
  supporting_context?: string[];
  draft_outreach?: { subject: string; body: string };
  reasoning_trace?: string;
};
export type NotificationDTO = {
  account_id: string;
  account_name: string;
  ae?: string;
  csm?: string;
  detected_gap: string;
  disqualifier_rule: string;
  explanation: string;
};

export const api = {
  me: () => get<{ role: string | null; user: string | null }>("/api/me"),
  users: () => get<UsersResponse>("/api/users"),
  runsLatest: () => get<RunSummary>("/api/runs/latest"),
  runs: () => get<{ runs: any[] }>("/api/runs"),
  signals: (role?: string, user?: string) => {
    const qs = new URLSearchParams();
    if (role) qs.set("role", role);
    if (user) qs.set("user", user);
    const q = qs.toString();
    return get<{ signals: Signal[] }>(`/api/signals${q ? `?${q}` : ""}`);
  },
  signal: (id: string) => get<Signal>(`/api/signals/${encodeURIComponent(id)}`),
  notifications: (role?: string, user?: string) => {
    const qs = new URLSearchParams();
    if (role) qs.set("role", role);
    if (user) qs.set("user", user);
    const q = qs.toString();
    return get<{ notifications: NotificationDTO[] }>(
      `/api/notifications${q ? `?${q}` : ""}`,
    );
  },
  account: (id: string) => get<any>(`/api/accounts/${encodeURIComponent(id)}`),
};
