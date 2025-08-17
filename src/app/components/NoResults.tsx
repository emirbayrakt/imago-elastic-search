"use client";

import { Home, SearchX, SlidersHorizontal, Undo2 } from "lucide-react";
import Link from "next/link";

type Props = {
    query?: string;
    onClearAll?: () => void;
    /** Called when the user wants to tweak filters (e.g., open a filters drawer on mobile) */
    onAdjustFilters?: () => void;
    hints?: string[];
};

export default function NoResults({
    query,
    onClearAll,
    onAdjustFilters,
    hints,
}: Props) {
    const defaultHints = [
        "Use fewer or broader keywords.",
        "Remove collection/date filters.",
        "Try an exact phrase in quotes.",
    ];

    const lines = hints && hints.length ? hints : defaultHints;

    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <div className="max-w-xl text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border border-dashed">
                    <SearchX
                        className="h-6 w-6 text-gray-700"
                        aria-hidden="true"
                    />
                </div>

                <h2 className="text-lg font-semibold tracking-tight">
                    No results {query ? <>for “{query}”</> : null}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    We couldn’t find any media matching your search.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {onClearAll && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                            <Undo2 className="h-4 w-4" />
                            Clear all
                        </button>
                    )}

                    {onAdjustFilters && (
                        <button
                            type="button"
                            onClick={onAdjustFilters}
                            className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Adjust filters
                        </button>
                    )}

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                        <Home className="h-4 w-4" />
                        Go home
                    </Link>
                </div>

                <ul className="mt-4 list-disc space-y-1 text-left text-sm text-gray-600 marker:text-gray-400">
                    {lines.map((t, i) => (
                        <li key={i}>{t}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
