"use client";

import { useEffect, useRef, useState } from "react";

type ApiDoc = {
    id: string;
    title: string;
    description?: string;
    db: string;
    thumbnailUrl: string;
    date?: string;
    mediaId: string;
    paddedMediaId: string;
    raw: Record<string, unknown>;
};
type ApiResponse = {
    page: number;
    size: number;
    total: number;
    results: ApiDoc[];
};
type ApiCacheFlags = { _cached?: boolean; _stale?: boolean };

export function useSearchFetch(params: {
    q: string;
    page: number;
    size: number;
    dbFromUrl: string[];
    start?: string;
    end?: string;
}) {
    const { q, page, size, dbFromUrl, start, end } = params;

    const prev = useRef<{
        q: string;
        db: string;
        start?: string;
        end?: string;
        page: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [hasFirstResponse, setHasFirstResponse] = useState(false);
    const [results, setResults] = useState<ApiDoc[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const [cacheHeader, setCacheHeader] = useState<string | null>(null);
    const [payloadCached, setPayloadCached] = useState(false);
    const [payloadStale, setPayloadStale] = useState(false);

    const [reloadFlag, setReloadFlag] = useState(0);
    const triggerReload = () => setReloadFlag((x) => x + 1);

    useEffect(() => {
        let cancelled = false;

        const qStr = q;
        const dbStr = dbFromUrl.join(",");
        const keyNow = { q: qStr, db: dbStr, start, end, page };

        const changedQueryOrFilters =
            !prev.current ||
            prev.current.q !== qStr ||
            prev.current.db !== dbStr ||
            prev.current.start !== start ||
            prev.current.end !== end;

        const changedPage = !prev.current || prev.current.page !== page;

        async function load() {
            setLoading(true);
            setError(null);

            if (changedQueryOrFilters || changedPage) setResults([]);
            setCacheHeader(null);
            setPayloadCached(false);
            setPayloadStale(false);

            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 12_000);

            try {
                const qs = new URLSearchParams();
                if (q) qs.set("q", q);
                qs.set("page", String(page));
                qs.set("size", String(size));
                if (dbFromUrl.length) qs.set("db", dbFromUrl.join(","));
                if (start) qs.set("start", start);
                if (end) qs.set("end", end);

                const res = await fetch(`/api/search?${qs.toString()}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });

                setCacheHeader(res.headers.get("x-cache"));

                if (!res.ok) {
                    let message = `Request failed (${res.status})`;
                    try {
                        const errJson = await res.json();
                        if (errJson?.error) message = errJson.error;
                    } catch {}
                    throw new Error(message);
                }

                const data: ApiResponse & ApiCacheFlags = await res.json();
                if (cancelled) return;

                setPayloadCached(Boolean(data._cached));
                setPayloadStale(Boolean(data._stale));
                setResults(data.results ?? []);
                setTotal(data.total ?? 0);
            } catch (e: unknown) {
                if (cancelled) return;
                const msg =
                    e instanceof Error
                        ? e.name === "AbortError"
                            ? "Timed out while contacting the search service."
                            : e.message
                        : "Something went wrong while loading results.";
                setError(msg);
            } finally {
                clearTimeout(t);
                if (!cancelled) {
                    setHasFirstResponse(true);
                    setLoading(false);
                }
            }
        }

        load();
        prev.current = keyNow;
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, page, size, dbFromUrl.join(","), start, end, reloadFlag]);

    return {
        loading,
        hasFirstResponse,
        results,
        total,
        error,
        cacheHeader,
        payloadCached,
        payloadStale,
        triggerReload,
    };
}
