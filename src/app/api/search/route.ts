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
import { cacheKey, sanitizeQuery } from "./utils/helpers";

import { INDEX, BASE_URL, CACHE_TTL_SECONDS } from "./constants";
import { buildEsBody } from "./esQuery";
import { readFreshCache, writeCache, tryServeStaleOnError } from "./cache";
import {
    cacheHitHeaders,
    cacheMissHeaders,
    cacheStaleHeaders,
} from "./headers";
import { ESSearchResponse, SearchCacheEntry } from "./types";

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

    // ---------------- Cache: fresh ----------------
    if (!bypassCache && canUseRedis && redis) {
        const cached = await readFreshCache(key);
        if (cached) {
            cached._cached = true;
            log({
                level: "info",
                msg: "search_cache_hit",
                ...reqLogBase,
                total: cached.total,
            });
            return NextResponse.json(cached, { headers: cacheHitHeaders() });
        }
    }

    try {
        // ---------------- Build ES query body ----------------
        const body = buildEsBody({
            q,
            dbFilterParam,
            start,
            end,
            from,
            size,
        });

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

        const payload: SearchCacheEntry = {
            page,
            size,
            total: resp.hits?.total?.value ?? docs.length,
            byDb,
            results: docs,
            _cached: false, // marker for UI
        };

        // Store in Redis
        if (!bypassCache && canUseRedis && redis) {
            await writeCache(key, payload, CACHE_TTL_SECONDS, reqLogBase);
        }

        // Logging + headers
        log({
            level: "info",
            msg: "search_ok",
            ...reqLogBase,
            total: payload.total,
            esMs: Math.round(esMs),
        });

        return NextResponse.json(payload, {
            headers: cacheMissHeaders(Math.round(esMs)),
        });
    } catch (err) {
        // On error, try serve stale cache if present
        const stale = await tryServeStaleOnError({
            err,
            bypassCache,
            canUseRedis,
            key,
            reqLogBase,
        });
        if (stale) {
            return NextResponse.json(stale, {
                status: 200,
                headers: cacheStaleHeaders(
                    err instanceof Error ? err.message : "search failed"
                ),
            });
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
