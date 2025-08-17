"use client";

import Filters from "@/app/components/Filters";
import type { FiltersState } from "@/app/components/Filters/types";

export default function Sidebar({
    dbFromUrl,
    start,
    end,
    onFiltersChange,
}: {
    dbFromUrl: string[];
    start?: string;
    end?: string;
    onFiltersChange: (v: FiltersState) => void;
}) {
    return (
        <aside className="hidden lg:block lg:sticky lg:top-4 self-start">
            <Filters
                value={{ db: dbFromUrl, start, end }}
                onChange={onFiltersChange}
            />
        </aside>
    );
}
