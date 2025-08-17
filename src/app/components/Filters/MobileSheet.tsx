"use client";

import { Filter, X } from "lucide-react";

export function MobileSheet({
    open,
    onClose,
    onClear,
    children,
}: {
    open: boolean;
    onClose: () => void;
    onClear: () => void;
    children: React.ReactNode;
}) {
    if (!open) return null;

    const handleBackdrop = () => onClose();

    return (
        <div
            className="lg:hidden fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            id="filters-sheet"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={handleBackdrop}
            />

            {/* Panel */}
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl animate-[slideIn_.2s_ease-out]">
                {/* Top bar (mobile) */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        <Filter className="h-4 w-4 text-gray-600" />
                        Filters
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close filters"
                        className="inline-flex items-center rounded-md border px-2 py-1.5 hover:bg-gray-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content (panel body) */}
                <div className="h-[calc(100vh-48px)] overflow-auto">
                    {children}
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 flex items-center gap-2 border-t bg-white px-4 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Keyframes */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0%);
                    }
                }
            `}</style>
        </div>
    );
}
