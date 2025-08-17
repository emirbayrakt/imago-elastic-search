"use client";

import { useEffect, useRef, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";

type UseSuggestionsArgs = {
    value: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    searchParams: ReadonlyURLSearchParams;
    onChange: (v: string) => void;
    onSubmit: (pickedSuggestion?: string) => void;
};

export function useSuggestions({
    value,
    inputRef,
    searchParams,
    onChange,
    onSubmit,
}: UseSuggestionsArgs) {
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [sLoading, setSLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState<number>(-1);

    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<number | null>(null);
    const suppressNextFetchRef = useRef(false);

    // Cmd/Ctrl+K focus
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [inputRef]);

    // Outside click to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!inputRef.current) return;
            // Close when clicking outside the whole combobox container
            const root = inputRef.current.closest('[role="combobox"]');
            if (root && !root.contains(e.target as Node)) {
                setOpen(false);
                setActiveIdx(-1);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [inputRef]);

    // Suggest fetch (debounced + abortable)
    useEffect(() => {
        const q = value.trim();

        if (suppressNextFetchRef.current) {
            suppressNextFetchRef.current = false;
            return;
        }

        if (q.length < 2) {
            setSuggestions([]);
            setOpen(false);
            setActiveIdx(-1);
            abortRef.current?.abort();
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            return;
        }

        setSLoading(true);
        abortRef.current?.abort();
        if (debounceRef.current) window.clearTimeout(debounceRef.current);

        const controller = new AbortController();
        abortRef.current = controller;

        const qs = new URLSearchParams({ q });
        const db = searchParams.get("db");
        if (db) qs.set("db", db);
        const start = searchParams.get("start");
        if (start) qs.set("start", start);
        const end = searchParams.get("end");
        if (end) qs.set("end", end);

        debounceRef.current = window.setTimeout(async () => {
            try {
                const resp = await fetch(`/api/suggest?${qs.toString()}`, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                const data = await resp.json();
                if (!controller.signal.aborted) {
                    const arr: string[] = Array.isArray(data?.suggestions)
                        ? data.suggestions
                        : [];
                    setSuggestions(arr);
                    const shouldOpen =
                        document.activeElement === inputRef.current;
                    setOpen(arr.length > 0 && shouldOpen);
                    setActiveIdx(-1);
                }
            } catch {
                // ignore
            } finally {
                if (!controller.signal.aborted) setSLoading(false);
            }
        }, 200) as unknown as number;

        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            controller.abort();
        };
    }, [value, searchParams, inputRef]);

    const handlePick = (picked?: string) => {
        if (picked) onChange(picked);

        setOpen(false);
        setSuggestions([]);
        setActiveIdx(-1);
        abortRef.current?.abort();
        if (debounceRef.current) window.clearTimeout(debounceRef.current);

        suppressNextFetchRef.current = true;
        inputRef.current?.blur();

        onSubmit(picked);
    };

    const handleInputFocus = (hasAny: boolean) => setOpen(hasAny);

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        suggs: string[]
    ) => {
        if (!open || suggs.length === 0) {
            if (e.key === "Enter") handlePick(); // raw input
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => (i < suggs.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => (i > 0 ? i - 1 : suggs.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIdx >= 0) handlePick(suggs[activeIdx]);
            else handlePick();
        } else if (e.key === "Escape") {
            setOpen(false);
            setActiveIdx(-1);
        }
    };

    const handleClearAllSideEffects = () => {
        setSuggestions([]);
        setOpen(false);
        setActiveIdx(-1);
        abortRef.current?.abort();
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };

    return {
        open,
        setOpen,
        suggestions,
        sLoading,
        activeIdx,
        setActiveIdx,
        handlePick,
        handleKeyDown,
        handleInputFocus,
        handleClearAllSideEffects,
    };
}
