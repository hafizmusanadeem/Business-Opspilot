import Link from "next/link";

export function SiteHeader() {
    return (
        <header className="site-header">
            <div className="container site-header__inner">
                <Link href="/" className="brand">
                    Business OpsPilot
                </Link>
                <nav aria-label="Main">
                    <Link href="/#services">Services</Link>
                    <Link href="/#process">Process</Link>
                    <Link href="/support">Get Support</Link>
                    <Link href="/login">Client Sign In</Link>
                </nav>
            </div>
        </header>
    );
}