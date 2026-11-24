const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
];

// "3 hours ago", "in 2 days". Server-side only: it reads the current time.
export function relativeTime(iso: string) {
    const diff = new Date(iso).getTime() - Date.now();
    for (const [unit, ms] of UNITS) {
        if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
    }
    return "just now";
}

export function formatDateTime(iso: string) {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function truncate(text: string | null | undefined, max = 80) {
    if (!text) return undefined;
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
