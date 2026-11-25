import Link from "next/link";

export function SiteFooter() {
    return (
        <footer>
            <div className="container btn-row" style={{ justifyContent: "space-between"}}>
                <span>© {new Date().getFullYear()} BusinessOpsPilot</span>
                <span className="btn-row">
                    <Link href="/request-proposal">Request a Proposal</Link>
                    <Link href="/support">Get Support</Link>
                    <Link href="/login">Client Sign In</Link>
                </span>
            </div>
        </footer>
    )
}