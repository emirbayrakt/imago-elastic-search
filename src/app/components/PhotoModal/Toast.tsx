"use client";

import { Check } from "lucide-react";

export default function Toast({ text }: { text: string }) {
    if (!text) return null;
    return (
        <div className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-xs text-white">
            <Check className="h-3.5 w-3.5" />
            {text}
        </div>
    );
}
