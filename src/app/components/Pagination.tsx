"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    page: number; // 1-based
    size: number; // items per page
    total: number; // total items
    onPageChange: (page: number) => void;
    maxPages?: number;
};

function range(from: number, to: number) {
    const out: number[] = [];
    for (let i = from; i <= to; i++) out.push(i);
    return out;
}

export default function Pagination({
    page,
    size,
    total,
    onPageChange,
    maxPages = 100,
}: Props) {
    const totalPagesByTotal = Math.max(1, Math.ceil(total / size));
    const totalPages = Math.min(totalPagesByTotal, maxPages);
    if (totalPages <= 1) return null;

    const windowSize = 2;
    const pages: (number | string)[] = [];

    pages.push(1);
    const start = Math.max(2, page - windowSize);
    if (start > 2) pages.push("…");
    for (const p of range(start, Math.min(totalPages - 1, page + windowSize))) {
        pages.push(p);
    }
    if (page + windowSize < totalPages - 1) pages.push("…");
    if (totalPages > 1) pages.push(totalPages);

    const go = (p: number) => {
        if (p >= 1 && p <= totalPages && p !== page) onPageChange(p);
    };

    const atFirst = page <= 1;
    const atLast = page >= totalPages;

    return (
        <nav
            className="mt-6 flex items-center justify-center gap-1.5 mb-8"
            aria-label="Pagination"
        >
            <button
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 border disabled:opacity-40"
                onClick={() => go(page - 1)}
                disabled={atFirst}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
            </button>

            {pages.map((p, i) =>
                typeof p === "number" ? (
                    <button
                        key={`${p}-${i}`}
                        onClick={() => go(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={[
                            "px-2 sm:px-3 py-1.5 border text-sm",
                            p === page
                                ? "bg-black text-white border-black"
                                : "hover:border-gray-400",
                        ].join(" ")}
                    >
                        {p}
                    </button>
                ) : (
                    <span
                        key={`ellipsis-${i}`}
                        className="sm:px-1.5 text-gray-500"
                    >
                        {p}
                    </span>
                )
            )}

            <button
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 border disabled:opacity-40"
                onClick={() => go(page + 1)}
                disabled={atLast}
                aria-label="Next page"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    );
}
