import type { Metadata } from "next";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { proposalFields } from "@/lib/intake/forms";
import { submitProposalRequest } from "./actions";

export const metadata: Metadata = { title: "Request a proposal" };

export default function RequestProposalPage() {
    return (
        <main className="container page">
            <p className="eyebrow">Sales</p>
            <h1>Request a proposal</h1>
            <p className="muted">
                Tell us about the work you want to automate. We use this to prepare a proposal.
            </p>
            <IntakeForm
                fields={proposalFields}
                action={submitProposalRequest}
                submitLabel="Request a proposal"
            />
        </main>
    );
}
