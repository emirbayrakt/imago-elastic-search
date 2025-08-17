"use client";

import { CornerDownLeft } from "lucide-react";
import { SuggestionItem } from "./SuggestionItem";

export const SuggestionsList = ({
    id,
    suggestions,
    activeIdx,
    setActiveIdx,
    onPick,
    loading,
    value,
}: {
    id: string;
    suggestions: string[];
    activeIdx: number;
    setActiveIdx: (i: number) => void;
    onPick: (s?: string) => void;
    loading: boolean;
    value: string;
}) => {
    return (
        <ul
            id={id}
            role="listbox"
            className="absolute z-40 mt-1 w-full border bg-white text-sm"
        >
            {suggestions.map((s, i) => (
                <SuggestionItem
                    key={`${s}-${i}`}
                    id={`sugg-${i}`}
                    active={i === activeIdx}
                    label={renderSuggestion(s, value)}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(-1)}
                    onClick={() => onPick(s)}
                />
            ))}
            {loading && (
                <li className="px-3 py-2 text-gray-500 flex items-center gap-2">
                    {/* Same spinner size/placement as before via text, keeps layout */}
                    <span className="inline-block h-4 w-4 animate-spin border-2 border-gray-300 border-t-transparent rounded-full" />
                    Loading…
                </li>
            )}
        </ul>
    );
};

function renderSuggestion(s: string, qRaw: string) {
    const q = qRaw.trim();
    const idx = s.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return s;
    const before = s.slice(0, idx);
    const match = s.slice(idx, idx + q.length);
    const after = s.slice(idx + q.length);
    return (
        <>
            {before}
            <mark className="bg-transparent text-black font-semibold">
                {match}
            </mark>
            {after}
            <span className="ml-auto inline-flex items-center text-xs text-gray-500">
                <CornerDownLeft className="mr-1 h-3.5 w-3.5" />
                Enter
            </span>
        </>
    );
}
