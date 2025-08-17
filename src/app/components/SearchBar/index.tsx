"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { ClearButton } from "./ClearButton";
import { SubmitButton } from "./SubmitButton";
import { SuggestionsList } from "./SuggestionsList";
import { Props } from "./types";
import { useSuggestions } from "@/hooks/useSuggestions";

export default function SearchBar({
    value,
    onChange,
    onSubmit,
    onClear,
    placeholder,
    loading = false,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sp = useSearchParams();

    const {
        open,
        activeIdx,
        setActiveIdx,
        suggestions,
        sLoading,
        handleInputFocus,
        handleKeyDown,
        handlePick,
        handleClearAllSideEffects,
    } = useSuggestions({
        value,
        inputRef,
        searchParams: sp,
        onChange,
        onSubmit,
    });

    return (
        <div
            ref={containerRef}
            className="relative"
            role="combobox"
            aria-expanded={open}
            aria-controls="search-suggest"
        >
            <form
                className="relative flex items-stretch gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    handlePick(); // raw submit unless a suggestion was chosen
                }}
                role="search"
                aria-label="Media search"
            >
                <div className="relative flex-1">
                    {/* Leading icon */}
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <SearchIcon className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <input
                        ref={inputRef}
                        type="search"
                        name="search"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, suggestions)}
                        onFocus={() => handleInputFocus(suggestions.length > 0)}
                        placeholder={
                            placeholder ?? "Search title, caption, keywords…"
                        }
                        className="w-full border border-gray-300 pl-9 md:pl-10 pr-1 md:pr-24 py-2.5 text-[15px] outline-none focus:border-gray-400"
                        aria-autocomplete="list"
                        aria-controls="search-suggest"
                        aria-activedescendant={
                            activeIdx >= 0 ? `sugg-${activeIdx}` : undefined
                        }
                        autoComplete="off"
                        spellCheck={false}
                    />

                    {/* Clear */}
                    <ClearButton
                        show={!!value && !loading}
                        onClick={() => {
                            onChange("");
                            handleClearAllSideEffects();
                            onClear?.();
                        }}
                    />

                    {/* ⌘K hint */}
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex select-none items-center rounded border px-1.5 py-0.5 text-[11px] text-gray-500">
                        ⌘K
                    </span>
                </div>

                <SubmitButton loading={loading} />
            </form>

            {/* Suggestions */}
            {open && suggestions.length > 0 && (
                <SuggestionsList
                    id="search-suggest"
                    suggestions={suggestions}
                    activeIdx={activeIdx}
                    setActiveIdx={setActiveIdx}
                    onPick={(s) => handlePick(s)}
                    loading={sLoading}
                    value={value}
                />
            )}
        </div>
    );
}
