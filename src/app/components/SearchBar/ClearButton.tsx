"use client";

import { X } from "lucide-react";

export const ClearButton = ({
    show,
    onClick,
}: {
    show: boolean;
    onClick: () => void;
}) => {
    if (!show) return null;
    return (
        <button
            type="button"
            onClick={onClick}
            className="absolute inset-y-0 right-0 lg:right-10 flex items-center pr-2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
        >
            <X className="h-5 w-5" />
        </button>
    );
};
