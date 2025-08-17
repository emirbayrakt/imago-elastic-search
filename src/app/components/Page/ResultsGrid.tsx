"use client";

import ResultCard from "@/app/components/ResultCard";
import Pagination from "@/app/components/Pagination";

type ApiDoc = {
    id: string;
    title: string;
    description?: string;
    db: string;
    thumbnailUrl: string;
    date?: string;
    mediaId: string;
    paddedMediaId: string;
    raw: Record<string, unknown>;
};

type Props = {
    results: ApiDoc[];
    page: number;
    size: number;
    total: number;
    onPageChange: (nextPage: number) => void;
    onOpen: (idx: number) => void;
};

export default function ResultsGrid({
    results,
    page,
    size,
    total,
    onPageChange,
    onOpen,
}: Props) {
    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-[6px] sm:gap-[5px]">
                {results.map((d, i) => (
                    <ResultCard
                        key={d.id}
                        title={d.title}
                        desc={d.description}
                        db={d.db}
                        url={d.thumbnailUrl}
                        date={d.date}
                        onClick={() => onOpen(i)}
                    />
                ))}
            </div>

            <Pagination
                page={page}
                size={size}
                total={total}
                onPageChange={onPageChange}
            />
        </>
    );
}
