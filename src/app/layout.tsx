import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "BusinessOpsPilot",
        template: "%s . BusinessOpsPilot",
    },
    description: "Client work, agents, and automations in one controlled system."
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}