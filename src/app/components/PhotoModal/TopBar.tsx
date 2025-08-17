"use client";

import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Hash,
    Image as ImageIcon,
} from "lucide-react";

export default function TopBar({
    title,
    dbLabel,
    date,
    bildnummer,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
}: {
    title: string;
    dbLabel?: string;
    date?: string;
    bildnummer: string;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev?: () => void;
    onNext?: () => void;
}) {
    return (
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex items-start gap-3">
                <h2
                    id="photo-modal-title"
                    className="min-w-0 flex-1 text-base sm:text-lg font-semibold leading-tight"
                    title={title || "Untitled"}
                >
                    <span className="line-clamp-2">{title || "Untitled"}</span>
                </h2>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <button
                        onClick={onPrev}
                        disabled={!hasPrev}
                        aria-label="Previous"
                        title="Previous"
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-800 enabled:hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!hasNext}
                        aria-label="Next"
                        title="Next"
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-800 enabled:hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                {dbLabel && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {dbLabel}
                    </span>
                )}
                {date && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {date}
                    </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
                    <Hash className="h-3.5 w-3.5" />
                    {bildnummer}
                </span>
            </div>
        </div>
    );
}
