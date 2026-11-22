import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const organizationName =
            typeof body?.organizationName === "string"
                ? body.organizationName.trim()
                : "";

        if (!organizationName || organizationName.length > 100) {
            return NextResponse.json(
                { error: "Organization name must contain 1 to 100 characters." },
                { status: 400 }
            );
        }

        const {
            data: organizationId,
            error: rpcError,
        } = await supabase.rpc("create_organization_for_current_user", {
            p_name: organizationName,
        });

        if (rpcError) {
            console.error("Organization onboarding failed:", rpcError);

            return NextResponse.json(
                { error: "Could not create organization." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { organizationId },
            { status: 201 }
        );
    } catch (error) {
        console.error("Onboarding request failed:", error);

        return NextResponse.json(
            { error: "Invalid request or server error." },
            { status: 400 }
        );
    }
}