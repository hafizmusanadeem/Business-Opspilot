import type { WorkList } from "@/lib/work/queries";

type Props = {
    title: string;
    description: string;
    list: WorkList;
    empty: React.ReactNode;
    // Marks the first item as the one to open next (queues are ordered for it).
    highlightFirst?: boolean;
};

export function WorkCard({ title, description, list, empty, highlightFirst }: Props) {
    return (
        <section className="card" aria-label={title}>
            <div className="card__head">
                <h3>{title}</h3>
                {!list.error && <span className="count">{list.count}</span>}
            </div>
            <p className="card__desc">{description}</p>

            {list.error ? (
                <p className="load-error" role="alert">
                    Could not load this list. Try refreshing the page.
                </p>
            ) : list.items.length === 0 ? (
                <p className="empty">{empty}</p>
            ) : (
                <ul className="items">
                    {list.items.map((item, index) => (
                        <li key={item.id}>
                            <div className="items__title">
                                {highlightFirst && index === 0 && <span className="badge">Next</span>}
                                {item.title}
                            </div>
                            {item.meta && <div className="items__meta">{item.meta}</div>}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export function Stat({
    label,
    value,
    alert,
}: {
    label: string;
    value: number | null;
    alert?: boolean;
}) {
    return (
        <div className={`stat${alert && value ? " stat--alert" : ""}`}>
            <div className="stat__value">{value ?? "—"}</div>
            <div className="stat__label">{label}</div>
        </div>
    );
}
