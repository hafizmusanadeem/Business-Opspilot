import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { supportFields } from "@/lib/intake/forms";
import { submitSupportRequest } from "./actions";

export const metadata: Metadata = { title: "Get support" };

export default function SupportPage() {
    return (
        <main className="container page">
            <p className="eyebrow">Support</p>
            <h1>Get support</h1>
            <p className="muted">
                For existing clients. If you have an account, you can also{" "}
                <Link href="/login">sign in</Link> to follow your requests in the portal.
            </p>
            <IntakeForm
                fields={supportFields}
                action={submitSupportRequest}
                submitLabel="Send support request"
            />
        </main>
    );
}
