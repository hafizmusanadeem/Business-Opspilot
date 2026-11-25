import Link from "next/link";
import type { OrgMembership } from "@/lib/auth/session";

type Props = {
    basePath: string;
    memberships: OrgMembership[];
    currentId: string;
};

// Rendered only when the verified user can use more than one organization.
// Plain links: the selection lives in the URL and is re-validated server-side.
export function OrgSwitcher({ basePath, memberships, currentId }: Props) {
    if (memberships.length < 2) return null;

    return (
        <nav className="switcher" aria-label="Switch organization">
            {memberships.map((m) => (
                <Link
                    key={m.organizationId}
                    href={`${basePath}?org=${m.organizationId}`}
                    aria-current={m.organizationId === currentId ? "page" : undefined}
                >
                    {m.organizationName}
                </Link>
            ))}
        </nav>
    );
}
