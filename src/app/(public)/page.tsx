import Link from "next/link";

const outcomes = [
    {
        title: "Less manual follow-up",
        body: "New leads and support requests are triaged the moment they arrive, so your team starts from a prepared record instead of an empty inbox.",
    },
    {
        title: "Faster, consistent responses",
        body: "Specialized agents draft replies and next steps against your own rules. Nothing leaves the building without the approval you require.",
    },
    {
        title: "Clear view of the work",
        body: "Every request, approval, and automation run is visible in one place, with failures surfaced instead of buried.",
    },
];

// Capabilities the platform is built around, not customer claims.
const proof = [
    { title: "Isolated by tenant", body: "Each organization's data is separated in the database itself, not just in the interface." },
    { title: "Humans stay in control", body: "Agents propose; people approve anything consequential before it happens." },
    { title: "Every run is recorded", body: "Automations leave a trail you can review, including the ones that fail." },
];

const process = [
    { title: "Intake", body: "A visitor asks for a proposal or support, with the right questions for each." },
    { title: "Triage", body: "Agents classify the request and prepare context and a suggested response." },
    { title: "Approval", body: "An operator reviews what the agents prepared and approves, edits, or rejects it." },
    { title: "Delivery", body: "Approved work is sent, tracked, and reported back to the client portal." },
];

export default function Home() {
    return (
        <main>
            <div className="container">
                <section className="hero">
                    <p className="eyebrow">AI operations platform</p>
                    <h1>Client work, agents, and automations in one controlled system.</h1>
                    <p>
                        BusinessOpsPilot turns client activity into workflows your team can see,
                        approve, and trust.
                    </p>
                    <div className="btn-row">
                        <Link href="/request-proposal" className="btn btn-primary">
                            Request a proposal
                        </Link>
                        <Link href="/support" className="btn">
                            Get support
                        </Link>
                    </div>
                </section>

                <section id="services" className="section">
                    <h2>What you get</h2>
                    <div className="grid grid-3">
                        {outcomes.map((item) => (
                            <div className="card" key={item.title}>
                                <h3>{item.title}</h3>
                                <p className="muted" style={{ marginBottom: 0 }}>{item.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="proof" className="section">
                    <h2>Built to be trusted</h2>
                    <div className="grid grid-3">
                        {proof.map((item) => (
                            <div className="card" key={item.title}>
                                <h3>{item.title}</h3>
                                <p className="muted" style={{ marginBottom: 0 }}>{item.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="process" className="section">
                    <h2>How it works</h2>
                    <ol className="steps">
                        {process.map((item) => (
                            <li key={item.title}>
                                <h3>{item.title}</h3>
                                <p className="muted" style={{ marginBottom: 0 }}>{item.body}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="section">
                    <div className="cta-band">
                        <h2>Ready to take work off your team?</h2>
                        <p className="muted">Tell us what you want to improve, or reach out if you are already a client.</p>
                        <div className="btn-row">
                            <Link href="/request-proposal" className="btn btn-primary">
                                Request a proposal
                            </Link>
                            <Link href="/support" className="btn">
                                Get support
                            </Link>
                            <Link href="/login" className="btn">
                                Client sign in
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
