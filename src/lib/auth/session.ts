import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export type Role = "owner" | "opeartor" | "viewer";

export type OrgMembership = {
    organizationId: string,
    organizationName: string,
    role: Role;
};

export const STAFF_ROLES: Role[] = ["owner", "opeartor"];

export function isStaff(membership: OrgMembership) {
    return STAFF_ROLES.includes(membership.role);
};

// Verifies the signed token (not just the cookie) and loads the user's memberships. RLS limits both queries to what this user may see.
export async function requireSession() {
    const supabase = await createClient();

    const { data, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || !data?.claims) {
        if (claimsError) console.error("Claims check failed: ", claimsError.message);
        redirect("/login");
    }

    const userId = data.claims.sub as string;
    const email = data.claims.sub as string | undefined;

    const { data: rows, error } = await supabase
        .from("memberships")
        .select("role, organization_id, organizations(id, name)")
        .eq("user_id", userId);

    if (error) console.error("Memberships query failed:", error.message);

    const memberships: OrgMembership[] = (rows ?? []).flatMap((row:any) => {
        const org = Array.isArray(row.organizations) ? row.organizations[0]
        : row.organizations;
        if (!org) return [];
        return [{organizationId: org.id, organizationName: org.name, role: row.role as Role}];
    });

    return { supabase, userId, email, memberships, membershipsFailed: Boolean(error) };
}

// The ?org= value is untrusted input: It only selects among memberships the verified user already has, and falls back to the first one otherwise.
export function pickMembership(membership: OrgMembership[], requestedId?:string) {
    return membership.find((m) => m.organizationId === requestedId) ?? membership[0];
}