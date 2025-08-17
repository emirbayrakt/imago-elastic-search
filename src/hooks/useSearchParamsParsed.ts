"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FiltersState } from "@/app/components/Filters/types";

export function useSearchParamsParsed() {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    const q = sp.get("q") ?? "";
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const size = Math.min(100, Math.max(1, Number(sp.get("size") ?? 40)));
    const dbParam = sp.get("db") ?? "";
    const start = sp.get("start") ?? undefined;
    const end = sp.get("end") ?? undefined;

    const dbFromUrl = useMemo(
        () =>
            dbParam
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
        [dbParam]
    );

    // Controlled search input mirrors URL q
    const [qInput, setQInput] = useState(q);
    useEffect(() => setQInput(q), [q]);

    function pushParams(
        next: URLSearchParams,
        opts: { replace?: boolean; scroll?: boolean } = {}
    ) {
        const s = next.toString();
        const url = s.length ? `${pathname}?${s}` : pathname;
        const doScroll = opts.scroll !== false; // default: true

        if (opts.replace) router.replace(url, { scroll: false });
        else router.push(url, { scroll: false });

        // Manually scroll (works reliably in prod on same-route param changes)
        if (doScroll && typeof window !== "undefined") {
            // let layout reflow once before scrolling
            requestAnimationFrame(() => {
                try {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } catch {
                    // Safari < 15 fallback
                    window.scrollTo(0, 0);
                }
            });
        }
    }

    function setParamsPatch(
        patch: Partial<{
            q: string;
            db: string[];
            start?: string;
            end?: string;
            page?: number;
        }>,
        opts?: { replace?: boolean; scroll?: boolean }
    ) {
        const next = new URLSearchParams(sp.toString());

        if ("q" in patch) {
            const term = (patch.q ?? "").trim();
            if (term) next.set("q", term);
            else next.delete("q");
            next.set("page", "1");
        }

        if ("db" in patch) {
            const v = (patch.db ?? []).filter(Boolean).join(",");
            if (v) next.set("db", v);
            else next.delete("db");
            next.set("page", "1");
        }

        if ("start" in patch) {
            const v = patch.start ?? "";
            if (v) next.set("start", v);
            else next.delete("start");
            next.set("page", "1");
        }

        if ("end" in patch) {
            const v = patch.end ?? "";
            if (v) next.set("end", v);
            else next.delete("end");
            next.set("page", "1");
        }

        if ("page" in patch && typeof patch.page === "number") {
            next.set("page", String(patch.page));
        }

        pushParams(next, opts);
    }

    const onSubmitSearch = (picked?: string) => {
        const prevQ = sp.get("q") ?? "";
        const term = (picked ?? qInput).trim();

        setQInput(term);

        const next = new URLSearchParams(sp.toString());
        if (term) next.set("q", term);
        else next.delete("q");

        if (term !== prevQ) {
            next.delete("db");
            next.delete("start");
            next.delete("end");
        }

        next.set("page", "1");
        pushParams(next, { scroll: true });
    };

    const onFiltersChange = (v: FiltersState) =>
        setParamsPatch(
            { db: v.db, start: v.start, end: v.end },
            { scroll: true }
        );

    const onPageChange = (nextPage: number) =>
        setParamsPatch({ page: nextPage }, { scroll: true });

    function clearFiltersInParams(next: URLSearchParams) {
        next.delete("db");
        next.delete("start");
        next.delete("end");
    }

    const onClearSearch = () => {
        const next = new URLSearchParams(sp.toString());
        next.delete("q");
        clearFiltersInParams(next);
        next.set("page", "1");
        pushParams(next, { replace: true, scroll: true });
    };

    return {
        // parsed
        q,
        page,
        size,
        dbFromUrl,
        start,
        end,
        // input
        qInput,
        setQInput,
        // helpers
        setParamsPatch,
        onSubmitSearch,
        onFiltersChange,
        onPageChange,
        onClearSearch,
        sp,
        pushParams,
    };
}
