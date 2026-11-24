import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { isStaff, pickMembership, requireSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/work/queries";

export const metadata: Metadata = { title: "Operations" };

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ org?:string }>;
}) {
    const { org } = await searchParams;
    const { supabase, email, memberships, membershipsFailed } = await requireSession();

    // Owner and Operator only. Clients(viewer) belong in the portal.
    const staffOrgs = memberships.filter(isStaff);

    if ( staffOrgs.length === 0 ) {
        if ( memberships.length > 0 ) redirect("/portal");
        return (
            <AppShell surface="Operations" email={email}>
                <h1>Operations</h1>
                <p className="empty">
                    {membershipsFailed
                        ? "Could not load your organizations. Try refreshing the page."
                        : "No organization found for this account."}
                </p>
            </AppShell>
        );
    };

    const current = pickMembership(staffOrgs, org);
    const { queues, counters, windowDays } = await getDashboardData(supabase, current.organizationId);
    const link = [{ href: "/portal", label: "Client Portal" }];

    return (
        <AppShell
            surface="Operations"
            email={email}
            organizationName={current.organizationName}
            links={links}
        >
            <div className="page__head">
                <div>
                    <h1>Operations</h1>
                    <p className="muted" style={{ marginBottom: 0 }}>
                        What needs attention, oldest first. Counters cover the last {windowDays} days.
                    </p>
                </div>
                <OrgSwitcher
                    basePath="/dashboard"
                    memberships={staffOrgs}
                    currentId={current.organizationId}
                />
            </div>

            <section aria-label="Counters" className="grid grid-4" style={{ marginBottom: "1.5rem" }}>
                <Stat label="Work received" value={counters.received} />
                <Stat label="Automated" value={counters.automated} />
                <Stat label="Awaiting review" value={counters.awaitingReview} />
                <Stat label="Failed" value={counters.failed} alert />
            </section>

            <div className="grid grid-2">
                <WorkCard
                    title="New leads"
                    description="Proposal requests no one has qualified yet. Delays here cost deals."
                    list={queues.leads}
                    empty="No new leads. Proposal requests will appear here."
                    highlightFirst
                />
                <WorkCard
                    title="Unresolved support"
                    description="Requests that are open or in progress. Clients are waiting on these."
                    list={queues.support}
                    empty="No unresolved support requests."
                    highlightFirst
                />
                <WorkCard
                    title="Pending approvals"
                    description="Agent work that cannot proceed until a person approves it."
                    list={queues.approvals}
                    empty="Nothing is waiting for approval."
                    highlightFirst
                />
                <WorkCard
                    title="Failed workflow runs"
                    description="Automations that stopped with an error. Work may be stuck behind these."
                    list={queues.failed}
                    empty="No failed runs in this period."
                />
            </div>

            <section className="card placeholder" style={{ marginTop: "1.5rem" }} aria-label="Activity timeline">
                <h3>Activity timeline</h3>
                <p className="empty">
                    Audit events will appear here once audit logging is built.
                </p>
            </section>
        </AppShell>
    );
}
// export default async function DashboardPage() {
//     const supabase = await createClient();

//     // Verify the signed token on the server. A cookie alone is not proof of identity.
//     const { data, error: claimsError } = await supabase.auth.getClaims();
//     if (claimsError || !data?.claims) {
//         if (claimsError) console.error("Claims check failed:", claimsError.message);
//         redirect("/login");
//     }

//     // RLS returns only organizations the verified user belongs to.
//     const { data: organizations, error } = await supabase
//         .from("organizations")
//         .select("id, name");

//     if (error) console.error("Organizations query failed:", error.message);

//     return (
//         <main>
//             <h1>Dashboard</h1>
//             <p>Signed in as {data.claims.email}</p>
//             <h2>Your organizations</h2>
//             {organizations && organizations.length > 0 ? (
//                 <ul>
//                     {organizations.map((org) => (
//                         <li key={org.id}>{org.name}</li>
//                     ))}
//                 </ul>
//             ) : (
//                 <p>No organization found for this account.</p>
//             )}
//         </main>
//     );
// }