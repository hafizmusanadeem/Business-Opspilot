import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Verify the signed token on the server. A cookie alone is not proof of identity.
    const { data, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || !data?.claims) {
        if (claimsError) console.error("Claims check failed:", claimsError.message);
        redirect("/login");
    }

    // RLS returns only organizations the verified user belongs to.
    const { data: organizations, error } = await supabase
        .from("organizations")
        .select("id, name");

    if (error) console.error("Organizations query failed:", error.message);

    return (
        <main>
            <h1>Dashboard</h1>
            <p>Signed in as {data.claims.email}</p>
            <h2>Your organizations</h2>
            {organizations && organizations.length > 0 ? (
                <ul>
                    {organizations.map((org) => (
                        <li key={org.id}>{org.name}</li>
                    ))}
                </ul>
            ) : (
                <p>No organization found for this account.</p>
            )}
        </main>
    );
}