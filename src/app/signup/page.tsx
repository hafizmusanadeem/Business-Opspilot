
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();

            // Step 1: Create the authenticated user.
            const { data, error: signupError } =
                await supabase.auth.signUp({
                    email,
                    password,
                });

            if (signupError) {
                setError(signupError.message);
                return;
            }

            // Email confirmation may prevent an immediate session.
            if (!data.session) {
                setError(
                    "Account created. Please complete email confirmation, then sign in to continue."
                );
                return;
            }

            // Step 2: Create the organization and owner membership.
            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ organizationName }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Organization creation failed.");
                return;
            }

            // Step 3: Enter the dashboard.
            router.push("/dashboard");
            router.refresh();

        } catch (error) {
            console.error("Signup failed:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Sign Up to OpsPilot</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    Organization Name
                    <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        maxLength={100}
                        required
                    />
                </label>

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                {error && <p role="alert">{error}</p>}
            </form>
        </main>
    );
}
