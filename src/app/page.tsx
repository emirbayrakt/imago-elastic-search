"use client";

import { useState, useEffect } from "react";
import Spinner from "./components/Spinner";
import SkeletonCard from "./components/SkeletonCard";
import NoResults from "./components/NoResults";
import PhotoModal from "./components/PhotoModal";
import type { PhotoDoc } from "./components/PhotoModal/types";
import ErrorPanel from "./components/Page/ErrorPanel";
import NonBlockingErrorRibbon from "./components/Page/NonBlockingErrorRibbon";
import ResultsGrid from "./components/Page/ResultsGrid";

import TopBar from "./components/Page/TopBar";
import MetaRow from "./components/Page/MetaRow";
import Sidebar from "./components/Page/Sidebar";
import { useSearchParamsParsed } from "@/hooks/useSearchParamsParsed";
import { useSearchFetch } from "@/hooks/useSearchFetch";

export default function Page() {
    // URL params + helpers
    const {
        q,
        page,
        size,
        dbFromUrl,
        start,
        end,
        qInput,
        setQInput,
        onSubmitSearch,
        onFiltersChange,
        onPageChange,
        onClearSearch,
        sp,
        pushParams,
    } = useSearchParamsParsed();

    // Data fetch
    const {
        loading,
        hasFirstResponse,
        results,
        total,
        error,
        cacheHeader,
        payloadCached,
        payloadStale,
        triggerReload,
    } = useSearchFetch({ q, page, size, dbFromUrl, start, end });

    // Modal selection
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    // Clamp modal index on results change
    useEffect(() => {
        if (selectedIdx === null) return;
        if (results.length === 0) {
            setSelectedIdx(null);
            return;
        }
        if (selectedIdx > results.length - 1)
            setSelectedIdx(results.length - 1);
    }, [results.length, selectedIdx]);

    // Range info
    const startIndex = (page - 1) * size + 1;
    const endIndex = Math.min(page * size, total);

    // Map selection to PhotoDoc
    const selectedDoc: PhotoDoc | null =
        selectedIdx !== null && results[selectedIdx]
            ? {
                  id: results[selectedIdx].id,
                  title: results[selectedIdx].title,
                  description: results[selectedIdx].description,
                  db: results[selectedIdx].db,
                  thumbnailUrl: results[selectedIdx].thumbnailUrl,
                  date: results[selectedIdx].date,
                  mediaId: results[selectedIdx].mediaId,
                  paddedMediaId: results[selectedIdx].paddedMediaId,
                  raw: results[selectedIdx].raw,
              }
            : null;

    const hasPrev = selectedIdx !== null && selectedIdx > 0;
    const hasNext = selectedIdx !== null && selectedIdx < results.length - 1;

    return (
        <main className="mx-auto max-w-[1400px] px-4 pb-8 md:px-6">
            {/* Top bar */}
            <TopBar
                qInput={qInput}
                setQInput={setQInput}
                loading={loading}
                onSubmit={onSubmitSearch}
                onClear={onClearSearch}
            />

            {/* Meta row */}
            <MetaRow
                hasFirstResponse={hasFirstResponse}
                error={error}
                startIndex={startIndex}
                endIndex={endIndex}
                total={total}
                dbFromUrl={dbFromUrl}
                start={start}
                end={end}
                onFiltersChange={onFiltersChange}
                cacheHeader={cacheHeader}
                payloadCached={payloadCached}
                payloadStale={payloadStale}
            />

            <div className="grid lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">
                {/* Sidebar (desktop) */}
                <Sidebar
                    dbFromUrl={dbFromUrl}
                    start={start}
                    end={end}
                    onFiltersChange={onFiltersChange}
                />

                {/* Gallery */}
                <section className="relative">
                    {error && !hasFirstResponse ? (
                        <ErrorPanel
                            message={error}
                            onRetry={triggerReload}
                            onClear={onClearSearch}
                        />
                    ) : !hasFirstResponse ||
                      (loading && results.length === 0) ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-[6px] sm:gap-[5px]">
                            {Array.from({ length: size }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : error && results.length === 0 ? (
                        <ErrorPanel
                            message={error}
                            onRetry={triggerReload}
                            onClear={onClearSearch}
                        />
                    ) : total === 0 ? (
                        <NoResults
                            query={q}
                            onClearAll={() => {
                                const next = new URLSearchParams(sp.toString());
                                next.delete("db");
                                next.delete("start");
                                next.delete("end");
                                next.set("page", "1");
                                next.delete("q");
                                pushParams(next, { scroll: false });
                            }}
                            onAdjustFilters={() => {
                                alert("Adjust filters clicked");
                            }}
                            hints={[
                                "Check spelling or remove special characters.",
                                "Try a different word (e.g., “cat” → “cats”).",
                                "Remove collection or date limits.",
                            ]}
                        />
                    ) : (
                        <ResultsGrid
                            results={results}
                            page={page}
                            size={size}
                            total={total}
                            onPageChange={onPageChange}
                            onOpen={(i) => setSelectedIdx(i)}
                        />
                    )}

                    {loading && results.length > 0 && (
                        <div className="pointer-events-none absolute right-2 top-2 rounded bg-white/80 px-2 py-1.5 text-xs text-gray-700 shadow-sm flex items-center gap-2">
                            <Spinner className="h-4 w-4" />
                            Updating…
                        </div>
                    )}

                    {error && results.length > 0 && (
                        <NonBlockingErrorRibbon message={error} />
                    )}
                </section>
            </div>

            {/* Modal */}
            <PhotoModal
                open={selectedIdx !== null}
                doc={selectedDoc}
                onClose={() => setSelectedIdx(null)}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={() =>
                    setSelectedIdx((i) => (i !== null && i > 0 ? i - 1 : i))
                }
                onNext={() =>
                    setSelectedIdx((i) =>
                        i !== null && i < results.length - 1 ? i + 1 : i
                    )
                }
            />
        </main>
    );
}
