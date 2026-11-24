import type { createClient } from "@/lib/supabase/server";
import { formatDateTime, relativeTime, truncate } from "@/lib/format";

type Client = Awaited<ReturnType<typeof createClient>>;

export type WorkItem = { id: string; title: string; meta?: string };
export type WorkList = { items: WorkItem[]; count: number; error: boolean };

type QueryResult = {
    data: any[] | null;
    count: number | null;
    error: { message: string } | null;
};

function toList(res: QueryResult, label: string, map: (row: any) => WorkItem): WorkList {
    if (res.error) {
        console.error(`${label} query failed:`, res.error.message);
        return { items: [], count: 0, error: true };
    }
    const items = (res.data ?? []).map(map);
    return { items, count: res.count ?? items.length, error: false };
}

// null means the query failed, so the UI can show "—" instead of a false zero.
function toCount(res: { count: number | null; error: { message: string } | null }, label: string) {
    if (res.error) {
        console.error(`${label} count failed:`, res.error.message);
        return null;
    }
    return res.count ?? 0;
}

const LIST_SIZE = 5;
const WINDOW_DAYS = 30;
const UNRESOLVED = ["open", "in_progress"];

function windowStart() {
    return new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
}

// Client portal. Explicit filters narrow what RLS already allows, so a staff
// member opening /portal still sees the client view, not the operator view.
export async function getPortalData(supabase: Client, organizationId: string, userId: string) {
    const [requests, meetings, projects, messages] = await Promise.all([
        supabase
            .from("support_requests")
            .select("id, subject, status, created_at", { count: "exact" })
            .eq("organization_id", organizationId)
            .eq("requester_id", userId)
            .in("status", UNRESOLVED)
            .order("created_at", { ascending: false })
            .limit(LIST_SIZE),
        supabase
            .from("meetings")
            .select("id, title, starts_at", { count: "exact" })
            .eq("organization_id", organizationId)
            .eq("status", "scheduled")
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
            .limit(LIST_SIZE),
        supabase
            .from("projects")
            .select("id, name, status", { count: "exact" })
            .eq("organization_id", organizationId)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(LIST_SIZE),
        supabase
            .from("messages")
            .select("id, body, created_at", { count: "exact" })
            .eq("organization_id", organizationId)
            .eq("visibility", "client")
            .order("created_at", { ascending: false })
            .limit(LIST_SIZE),
    ]);

    return {
        requests: toList(requests, "Requests", (r) => ({
            id: r.id,
            title: r.subject,
            meta: `${r.status.replace("_", " ")} · ${relativeTime(r.created_at)}`,
        })),
        meetings: toList(meetings, "Meetings", (r) => ({
            id: r.id,
            title: r.title,
            meta: formatDateTime(r.starts_at),
        })),
        projects: toList(projects, "Projects", (r) => ({ 
            id: r.id,
            title: r.name, 
            meta: r.status 
        })),
        messages: toList(messages, "Messages", (r) => ({
            id: r.id,
            title: truncate(r.body, 90) ?? "",
            meta: relativeTime(r.created_at),
        })),
    };
}

// Operator dashboard. Oldest-first where waiting time matters (leads,
// support, approvals); newest-first for failures.
export async function getDashboardData(supabase: Client, organizationId: string) {
    const since = windowStart();

    const [leads, support, approvals, failed, leadsIn, supportIn, automated] = await Promise.all([
        supabase
            .from("leads")
            .select("id, contact_name, company, created_at", { count: "exact" })
            .eq("organization_id", organizationId)
            .eq("status", "new")
            .order("created_at", { ascending: true })
            .limit(LIST_SIZE),
        supabase
            .from("support_requests")
            .select("id, subject, status, created_at", { count: "exact" })
            .eq("organization_id", organizationId)
            .in("status", UNRESOLVED)
            .order("created_at", { ascending: true })
            .limit(LIST_SIZE),
        supabase
            .from("approvals")
            .select("id, title, created_at", { count: "exact" })
            .eq("organization_id", organizationId)
            .eq("status", "pending")
            .order("created_at", { ascending: true })
            .limit(LIST_SIZE),
        supabase
            .from("workflow_runs")
            .select("id, workflow_name, error_message, started_at", { count: "exact" })
            .eq("organization_id", organizationId)
            .eq("status", "failed")
            .gte("started_at", since)
            .order("started_at", { ascending: false })
            .limit(LIST_SIZE),
        supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", organizationId)
            .gte("created_at", since),
        supabase
            .from("support_requests")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", organizationId)
            .gte("created_at", since),
        supabase
            .from("workflow_runs")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", organizationId)
            .eq("status", "succeeded")
            .gte("started_at", since),
    ]);

    const leadList = toList(leads, "Leads", (r) => ({
        id: r.id,
        title: r.company || r.contact_name,
        meta: `${r.contact_name} · waiting ${relativeTime(r.created_at).replace(" ago", "")}`,
    }));
    const supportList = toList(support, "Support", (r) => ({
        id: r.id,
        title: r.subject,
        meta: `${r.status.replace("_", " ")} · opened ${relativeTime(r.created_at)}`,
    }));
    const approvalList = toList(approvals, "Approvals", (r) => ({
        id: r.id,
        title: r.title,
        meta: `waiting ${relativeTime(r.created_at).replace(" ago", "")}`,
    }));
    const failedList = toList(failed, "Failed runs", (r) => ({
        id: r.id,
        title: r.workflow_name,
        meta: [truncate(r.error_message, 70), relativeTime(r.started_at)].filter(Boolean).join(" · "),
    }));

    const receivedLeads = toCount(leadsIn, "Leads received");
    const receivedSupport = toCount(supportIn, "Support received");
    const received =
        receivedLeads === null || receivedSupport === null ? null : receivedLeads + receivedSupport;

    return {
        windowDays: WINDOW_DAYS,
        queues: { leads: leadList, support: supportList, approvals: approvalList, failed: failedList },
        counters: {
            received,
            automated: toCount(automated, "Automated runs"),
            awaitingReview: approvalList.error ? null : approvalList.count,
            failed: failedList.error ? null : failedList.count,
        },
    };
}
