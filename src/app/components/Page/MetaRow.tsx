"use client";

import CacheBadge from "./CacheBadge";
import Filters from "@/app/components/Filters";
import type { FiltersState } from "@/app/components/Filters/types";

export default function MetaRow({
    hasFirstResponse,
    error,
    startIndex,
    endIndex,
    total,
    dbFromUrl,
    start,
    end,
    onFiltersChange,
    cacheHeader,
    payloadCached,
    payloadStale,
}: {
    hasFirstResponse: boolean;
    error: string | null;
    startIndex: number;
    endIndex: number;
    total: number;
    dbFromUrl: string[];
    start?: string;
    end?: string;
    onFiltersChange: (v: FiltersState) => void;
    cacheHeader: string | null;
    payloadCached: boolean;
    payloadStale: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center gap-3 pb-3 text-sm text-gray-600 min-h-[1.5rem]">
            {hasFirstResponse && !error ? (
                <>
                    <div>
                        {total
                            ? `Showing ${startIndex}–${endIndex} of ${total}`
                            : "No results"}
                    </div>
                    <CacheBadge
                        cacheHeader={cacheHeader}
                        payloadCached={payloadCached}
                        payloadStale={payloadStale}
                    />
                </>
            ) : (
                <div className="invisible">placeholder</div>
            )}

            <div className="block lg:hidden ml-auto">
                <Filters
                    value={{ db: dbFromUrl, start, end }}
                    onChange={onFiltersChange}
                />
            </div>
        </div>
    );
}
