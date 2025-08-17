export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getEs } from "@/lib/es";
import { normalizeHit, NormalizedDoc, ImagoHit } from "@/lib/normalize";
import withTimeout from "@/lib/timeout";
import { ensureRedis, redis } from "@/lib/redis";
import { log } from "@/lib/logger";
import { time } from "@/lib/timer";

// Filters agg returns a map of named buckets.
type FiltersBuckets = Record<string, { doc_count: number }>;
type AggsByDbFilters = { buckets: FiltersBuckets };
type ESSearchResponse = {
    hits: { total?: { value: number }; hits: ImagoHit[] };
    aggregations?: { by_db?: AggsByDbFilters };
};

const INDEX = process.env.IMAGO_INDEX || "imago";
const BASE_URL = process.env.IMAGO_BASE_URL || "https://www.imago-images.de";
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 3600); // 1h default

/** Map client `db` filters (st/sp/stock/sport) to raw ES values ('stock'|'sport'). */
function mapFilterDbParam(param: string): string[] {
    return param
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean)
        .map((v) =>
            v === "st" || v === "stock"
                ? "stock"
                : v === "sp" || v === "sport"
                ? "sport"
                : v
        );
}

/** Trim and collapse whitespace; avoids accidental empty/odd tokens. */
function sanitizeQuery(q: string): string {
    return q.replace(/\s+/g, " ").trim();
}

/** True if query looks like a numeric id suitable for `bildnummer` term lookup. */
function isNumericQuery(q: string): boolean {
    return /^\d{2,}$/.test(q);
}

/** Deterministic cache key for the same logical search. */
function cacheKey(p: {
    q?: string;
    page: number;
    size: number;
    db?: string;
    start?: string;
    end?: string;
}) {
    const { q = "", page, size, db = "", start = "", end = "" } = p;
    return `imago:search:v1:q=${encodeURIComponent(
        q
    )}&page=${page}&size=${size}&db=${db}&start=${start}&end=${end}`;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawQ = searchParams.get("q") || "";
    const q = sanitizeQuery(rawQ);

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const size = Math.min(
        Math.max(1, Number(searchParams.get("size") || 40)),
        100
    );
    const from = (page - 1) * size;

    const dbFilterParam = searchParams.get("db") || "";
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    // allow bypass: /api/search?...&cache=0
    const bypassCache = searchParams.get("cache") === "0";

    const key = cacheKey({ q, page, size, db: dbFilterParam, start, end });
    const canUseRedis = await ensureRedis();

    const reqLogBase = {
        q: q.slice(0, 100),
        page,
        size,
        db: dbFilterParam,
        start,
        end,
    };

    // Try cache first (unless bypassed)
    if (!bypassCache && canUseRedis && redis) {
        try {
            const cachedStr = await redis.get(key);
            if (cachedStr) {
                const cached = JSON.parse(cachedStr) as {
                    page: number;
                    size: number;
                    total: number;
                    byDb?: Record<string, number>;
                    results: NormalizedDoc[];
                    _cached?: boolean;
                    _stale?: boolean;
                };
                cached._cached = true;

                log({
                    level: "info",
                    msg: "search_cache_hit",
                    ...reqLogBase,
                    total: cached.total,
                });

                const headers = new Headers();
                headers.set("x-cache", "HIT");
                headers.set("cache-control", "no-store");
                headers.set("server-timing", "cache;desc=hit");
                return NextResponse.json(cached, { headers });
            }
        } catch (e) {
            // Don't fail the request if Redis read has issues.
            log({
                level: "warn",
                msg: "search_cache_read_error",
                ...reqLogBase,
                error: e instanceof Error ? e.message : String(e),
            });
        }
    }

    try {
        // ----------------------- Build ES query body -----------------------
        const should: unknown[] = [];
        const filter: unknown[] = [];

        if (dbFilterParam) {
            const rawDbValues = mapFilterDbParam(dbFilterParam);
            filter.push({ terms: { db: rawDbValues } }); // ES stores 'stock'/'sport'
        }
        if (start || end) {
            filter.push({
                range: {
                    datum: {
                        ...(start ? { gte: start } : {}),
                        ...(end ? { lte: end } : {}),
                    },
                },
            });
        }

        const titleFields = ["title", "headline", "titel"] as const;
        const descFields = [
            "description",
            "summary",
            "caption",
            "suchtext",
        ] as const;
        const otherFields = ["keywords", "tags", "fotografen"] as const;

        if (q) {
            // 1) exact phrase in BOTH title-like and desc-like fields
            should.push({
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: q,
                                type: "phrase",
                                slop: 0,
                                fields: titleFields.map((f) => `${f}^1`),
                            },
                        },
                        {
                            multi_match: {
                                query: q,
                                type: "phrase",
                                slop: 0,
                                fields: descFields.map((f) => `${f}^1`),
                            },
                        },
                    ],
                    boost: 9,
                },
            });

            // 2) exact phrase in title-like fields
            should.push({
                multi_match: {
                    query: q,
                    type: "phrase",
                    slop: 0,
                    fields: ["title^8", "headline^7", "titel^6"],
                },
            });

            // 3) exact phrase in desc-like fields
            should.push({
                multi_match: {
                    query: q,
                    type: "phrase",
                    slop: 0,
                    fields: [
                        "suchtext^7",
                        "caption^5",
                        "summary^4",
                        "description^3",
                    ],
                },
            });

            // 4) strict AND across all text fields (recall fallback)
            should.push({
                multi_match: {
                    query: q,
                    type: "best_fields",
                    operator: "AND",
                    minimum_should_match: "100%",
                    fields: [
                        "title^5",
                        "headline^5",
                        "titel^4",
                        "suchtext^4",
                        "caption^3",
                        "summary^3",
                        "description^2",
                        ...otherFields,
                    ],
                },
            });

            // numeric lookup for bildnummer
            if (isNumericQuery(q)) {
                const num = Number(q);
                if (Number.isSafeInteger(num)) {
                    should.push({ term: { bildnummer: num } });
                }
            }
        }

        const body: Record<string, unknown> = {
            track_total_hits: true,
            query: {
                bool: {
                    should: q ? should : [{ match_all: {} }],
                    filter,
                    minimum_should_match: q ? 1 : 0,
                },
            },
            from,
            size,
            sort: [
                { _score: { order: "desc" } },
                { datum: { order: "desc", unmapped_type: "date" } },
            ],
            _source: true,
            aggs: {
                by_db: {
                    filters: {
                        filters: {
                            stock: { match: { db: "stock" } },
                            sport: { match: { db: "sport" } },
                            other: {
                                bool: {
                                    must: [{ exists: { field: "db" } }],
                                    must_not: [
                                        { match: { db: "stock" } },
                                        { match: { db: "sport" } },
                                    ],
                                },
                            },
                            unknown: {
                                bool: {
                                    must_not: [{ exists: { field: "db" } }],
                                },
                            },
                        },
                    },
                },
            },
        };
        const es = getEs();

        // ---- ES call with timing
        const { res: esResp, ms: esMs } = await time("es.search", async () =>
            withTimeout(es.search({ index: INDEX, body }), 4_000)
        );
        const resp = esResp as ESSearchResponse;

        const hits: ImagoHit[] = resp.hits?.hits ?? [];
        const docs: NormalizedDoc[] = hits.map((h) =>
            normalizeHit(h, BASE_URL)
        );

        // Build global facet counts from the FILTERS agg
        const buckets = resp.aggregations?.by_db?.buckets ?? {};
        const stockCount = buckets.stock?.doc_count ?? 0;
        const sportCount = buckets.sport?.doc_count ?? 0;
        const otherCount = buckets.other?.doc_count ?? 0;
        const unknownCount = buckets.unknown?.doc_count ?? 0;

        const byDb: Record<string, number> = { st: stockCount, sp: sportCount };
        if (otherCount > 0) byDb.other = otherCount;
        if (unknownCount > 0) byDb.unknown = unknownCount;

        const payload = {
            page,
            size,
            total: resp.hits?.total?.value ?? docs.length,
            byDb,
            results: docs,
            _cached: false, // marker for UI
        };

        // Store in Redis
        if (!bypassCache && canUseRedis && redis) {
            try {
                await redis.set(
                    key,
                    JSON.stringify(payload),
                    "EX",
                    CACHE_TTL_SECONDS
                );
            } catch (e) {
                log({
                    level: "warn",
                    msg: "search_cache_write_error",
                    ...reqLogBase,
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        }

        // Logging + headers
        log({
            level: "info",
            msg: "search_ok",
            ...reqLogBase,
            total: payload.total,
            esMs: Math.round(esMs),
        });

        const headers = new Headers();
        headers.set("x-cache", "MISS");
        headers.set("cache-control", "no-store");
        headers.set("server-timing", `es;dur=${Math.round(esMs)}`);

        return NextResponse.json(payload, { headers });
    } catch (err) {
        // On error, try serve stale cache if present
        if (!bypassCache && canUseRedis && redis) {
            try {
                const cachedStr = await redis.get(key);
                if (cachedStr) {
                    const stale = JSON.parse(cachedStr) as {
                        page: number;
                        size: number;
                        total: number;
                        byDb?: Record<string, number>;
                        results: NormalizedDoc[];
                        _cached?: boolean;
                        _stale?: boolean;
                    };
                    stale._cached = true;
                    stale._stale = true;

                    log({
                        level: "warn",
                        msg: "search_stale_serve",
                        ...reqLogBase,
                        total: stale.total,
                        error: err instanceof Error ? err.message : String(err),
                    });

                    const headers = new Headers();
                    headers.set("x-cache", "STALE");
                    headers.set("cache-control", "no-store");
                    headers.set("server-timing", "cache;desc=stale");
                    headers.set(
                        "x-error",
                        err instanceof Error ? err.message : "search failed"
                    );
                    return NextResponse.json(stale, { status: 200, headers });
                }
            } catch {
                // ignore read errors here
            }
        }

        const message = err instanceof Error ? err.message : "Search failed";
        log({
            level: "error",
            msg: "search_error",
            ...reqLogBase,
            error: message,
        });

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
