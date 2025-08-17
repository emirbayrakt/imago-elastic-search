"use client";

import { X } from "lucide-react";

export default function CloseButton({ onClose }: { onClose: () => void }) {
    return (
        <button
            onClick={onClose}
            aria-label="Close"
            className="absolute -right-2 -top-5 sm:-right-5 sm:-top-2 xl:-right-14 xl:-top-6 z-20
                 inline-flex h-9 w-9 items-center justify-center rounded-full
                 bg-white text-gray-700 shadow ring-1 ring-black/10
                 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
        >
            <X className="h-4 w-4" />
        </button>
    );
}
