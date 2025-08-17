"use client";

import { useEffect, useState } from "react";
import { FiltersState } from "./types";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileTrigger } from "./MobileTrigger";
import { MobileSheet } from "./MobileSheet";
import FiltersPanel from "./FiltersPanel";

type Props = {
    value: FiltersState;
    onChange: (v: FiltersState) => void;
};

export default function Filters({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);

    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const toggleDb = (k: "st" | "sp") => {
        const set = new Set(value.db);
        if (set.has(k)) set.delete(k);
        else set.add(k);
        onChange({ ...value, db: Array.from(set) });
    };

    const update = (patch: Partial<FiltersState>) => {
        onChange({ ...value, ...patch });
    };

    const clearAll = () => {
        onChange({ db: [], start: undefined, end: undefined });
    };

    return (
        <>
            {/* MOBILE trigger (<lg) */}
            <MobileTrigger open={open} onOpen={() => setOpen(true)} />

            {/* DESKTOP static sidebar (lg+) */}
            <DesktopSidebar>
                <FiltersPanel
                    value={value}
                    onChange={onChange}
                    toggleDb={toggleDb}
                    update={update}
                    clearAll={clearAll}
                />
            </DesktopSidebar>

            {/* MOBILE slide-in sheet */}
            <MobileSheet
                open={open}
                onClose={() => setOpen(false)}
                onClear={clearAll}
            >
                <FiltersPanel
                    value={value}
                    onChange={onChange}
                    toggleDb={toggleDb}
                    update={update}
                    clearAll={clearAll}
                    // Header inside panel is hidden on mobile; MobileSheet has its own top bar
                />
            </MobileSheet>
        </>
    );
}
