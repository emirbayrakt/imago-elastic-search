"use client";

type Props = {
    cacheHeader: string | null; // "HIT" | "MISS" | "STALE" | null
    payloadCached: boolean;
    payloadStale: boolean;
};

export default function CacheBadge({
    cacheHeader,
    payloadCached,
    payloadStale,
}: Props) {
    // Header wins if present, else payload flags.
    const state =
        cacheHeader || (payloadStale ? "STALE" : payloadCached ? "HIT" : null);
    if (!state || state === "MISS") return null;

    const label = state === "STALE" ? "Stale" : "Cached";
    const className =
        state === "STALE"
            ? "bg-amber-500 text-white"
            : "bg-emerald-600 text-white";

    return (
        <span
            className={[
                "hidden sm:inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium",
                className,
            ].join(" ")}
            title={
                state === "STALE"
                    ? "Served from cache (stale fallback)"
                    : "Served from cache"
            }
        >
            {label}
        </span>
    );
}
