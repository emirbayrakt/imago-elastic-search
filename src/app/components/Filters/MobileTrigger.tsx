"use client";

import { Filter } from "lucide-react";

export function MobileTrigger({
    open,
    onOpen,
}: {
    open: boolean;
    onOpen: () => void;
}) {
    return (
        <div className="lg:hidden">
            <button
                type="button"
                onClick={onOpen}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls="filters-sheet"
            >
                <Filter className="h-4 w-4" />
                Filters
            </button>
        </div>
    );
}
