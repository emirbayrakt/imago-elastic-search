import { NormalizedDoc, ImagoHit } from "@/lib/normalize";

export type FiltersBuckets = Record<string, { doc_count: number }>;
export type AggsByDbFilters = { buckets: FiltersBuckets };

export type ESSearchResponse = {
    hits: { total?: { value: number }; hits: ImagoHit[] };
    aggregations?: { by_db?: AggsByDbFilters };
};

export type SearchCacheEntry = {
    page: number;
    size: number;
    total: number;
    byDb?: Record<string, number>;
    results: NormalizedDoc[];
    _cached?: boolean;
    _stale?: boolean;
};
