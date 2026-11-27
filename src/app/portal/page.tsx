import { isStaff, pickMembership, requireSession } from "@/lib/auth/session";
import { getPortalData } from "@/lib/work/queries";
import { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { WorkCard } from "@/components/app/WorkCard";
import { OrgSwitcher } from "@/components/app/OrgSwitcher";

export const metadata: Metadata = { title: "ClientPortal" };

export default async function PortalPage({
    searchParams,
}: {
    searchParams: Promise<{ org?: string }>;
}) {
    const { org } = await searchParams;
    const { supabase, userId, email, memberships, membershipsFailed } = await requireSession();

    const current = pickMembership(memberships, org);
    const link = memberships.some(isStaff) ? [{ href: "/dashboard", label: "Operations" }]: [];

    if (!current) {
        return (
            <AppShell surface="Client portal" email={email} links={link}>
                <h1>Client portal</h1>
                <p className="empty">
                    {membershipsFailed
                        ? "Could not load your organizations. Try refreshing the page."
                        : "No organization found for this account."}
                </p>
            </AppShell>
        );
    }

    const data = await getPortalData(supabase, current.organizationId, userId);

    return (
        <AppShell
            surface="Client portal"
            email={email}
            organizationName={current.organizationName}
            links={link}
        >
            <div className="page__head">
                <div>
                    <h1>{current.organizationName}</h1>
                    <p className="muted" style={{ marginBottom: 0 }}>
                        Your requests, meetings, projects, and messages.
                    </p>
                </div>
                <OrgSwitcher
                    basePath="/portal"
                    memberships={memberships}
                    currentId={current.organizationId}
                />
            </div>

            <div className="grid grid-2">
                <WorkCard
                    title="Open requests"
                    description="Support requests you have sent that are not resolved yet."
                    list={data.requests}
                    empty={
                        <>
                            You have no open requests. Need help?{" "}
                            <Link href="/support">Get support</Link>.
                        </>
                    }
                />
                <WorkCard
                    title="Upcoming meetings"
                    description="Scheduled sessions with your team."
                    list={data.meetings}
                    empty="No meetings are scheduled."
                />
                <WorkCard
                    title="Active projects"
                    description="Work currently in progress for your organization."
                    list={data.projects}
                    empty="No active projects yet."
                />
                <WorkCard
                    title="Recent messages"
                    description="Latest messages shared with you."
                    list={data.messages}
                    empty="No messages yet."
                />
            </div>
        </AppShell>
    );
}