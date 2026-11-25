import Link from "next/link";
import { signOut } from "@/app/auth/actions";

type Props = {
    surface: string;
    email?: string;
    organizationName?: string;
    links?: { href: string; label: string }[];
    children: React.ReactNode;
};

// Shared frame for the signed-in surfaces (client portal, operator dashboard).
// Keeping one shell keeps them consistent; each page still enforces its own
// role check, so the shell grants nothing.
export function AppShell({ surface, email, organizationName, links = [], children }: Props) {
    return (
        <>
            <header className="site-header">
                <div className="container site-header__inner">
                    <span className="btn-row" style={{ alignItems: "center" }}>
                        <Link href="/" className="brand">
                            BusinessOpsPilot
                        </Link>
                        <span className="surface-tag">{surface}</span>
                    </span>
                    <nav aria-label="Account">
                        {links.map((link) => (
                            <Link key={link.href} href={link.href}>
                                {link.label}
                            </Link>
                        ))}
                        {email && <span className="muted">{email}</span>}
                        <form action={signOut}>
                            <button type="submit" className="btn">
                                Sign out
                            </button>
                        </form>
                    </nav>
                </div>
            </header>
            <main className="container page">
                {organizationName && <p className="eyebrow">{organizationName}</p>}
                {children}
            </main>
        </>
    );
}
