export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getEs } from "@/lib/es";
import withTimeout from "@/lib/timeout";
import { ensureRedis, redis } from "@/lib/redis";

import { INDEX, SUGGEST_TTL_SECONDS } from "./constants";
import { sanitize, stripPunct, toNice } from "./text";
import { collectCandidates } from "./candidates";
import { buildSuggestBody } from "./esQuery";
import { cacheKey, readCache, writeCache } from "./cache";
import {
    cacheHitHeaders,
    cacheMissHeaders,
    cacheStaleHeaders,
} from "./headers";
import { Src } from "./types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const qRaw = searchParams.get("q") || "";
        const q = sanitize(qRaw);
        if (q.length < 2) {
            return NextResponse.json(
                { suggestions: [] },
                { headers: { "x-cache": "SKIP", "cache-control": "no-store" } }
            );
        }
        const prefixLower = q.toLowerCase();

        // align suggestions with current filters
        const dbParam = searchParams.get("db") || ""; // 'st,sp' or 'stock,sport'
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const bypassCache = searchParams.get("cache") === "0";

        const key = cacheKey(prefixLower, dbParam, start, end);
        const canUseRedis = await ensureRedis();

        // Try cache first unless bypassed
        if (!bypassCache && canUseRedis && redis) {
            try {
                const cached = await readCache(key);
                if (cached) {
                    return NextResponse.json(cached, {
                        headers: cacheHitHeaders(),
                    });
                }
            } catch (e) {
                console.warn("[redis] suggest read error:", e);
            }
        }

        // Build ES request body (prefix search + aligned filters)
        const body = buildSuggestBody({ q, dbParam, start, end });

        const es = getEs();
        const resp = await withTimeout(
            es.search({ index: INDEX, body }),
            4_000
        );
        const hits = (resp?.hits?.hits ?? []) as Array<{ _source?: Src }>;

        // Mine phrases from hits
        const freq = new Map<
            string,
            { count: number; display: string; grams: number }
        >();

        for (const h of hits) {
            const cand = collectCandidates(h._source ?? {}, prefixLower);
            for (let s of cand) {
                s = stripPunct(s).replace(/\s+/g, " ").trim();
                if (!s) continue;

                // only 1-grams and 2-grams (same logic)
                const grams = s
                    .toLowerCase()
                    .split(/[^a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]+/i)
                    .filter((t) => t.length >= 2).length;
                if (grams === 0 || grams > 2) continue;

                const keyL = s.toLowerCase();
                const prev = freq.get(keyL);
                if (prev) prev.count += 1;
                else freq.set(keyL, { count: 1, display: s, grams });
            }
        }

        // Rank: freq desc, then 2-grams over 1-grams, then shorter, then lexicographic
        const ranked = Array.from(freq.entries()).sort((a, b) => {
            const A = a[1],
                B = b[1];
            if (B.count !== A.count) return B.count - A.count;
            if (B.grams !== A.grams) return B.grams - A.grams; // 2 > 1
            if (A.display.length !== B.display.length)
                return A.display.length - B.display.length;
            return a[0].localeCompare(b[0]);
        });

        const suggestions = ranked
            .slice(0, 8)
            .map(([, v]) => toNice(v.display));
        const payload = { suggestions, _cached: false };

        // Write cache
        if (!bypassCache && canUseRedis && redis) {
            try {
                await writeCache(key, payload, SUGGEST_TTL_SECONDS);
            } catch (e) {
                console.warn("[redis] suggest write error:", e);
            }
        }

        return NextResponse.json(payload, { headers: cacheMissHeaders() });
    } catch (e) {
        // Serve stale if available (same semantics as before)
        try {
            const { searchParams } = new URL(req.url);
            const key = cacheKey(
                sanitize(searchParams.get("q") || "").toLowerCase(),
                searchParams.get("db") || "",
                searchParams.get("start"),
                searchParams.get("end")
            );
            if (await ensureRedis()) {
                const cachedStr = await redis?.get(key);
                if (cachedStr) {
                    const stale = JSON.parse(cachedStr) as {
                        suggestions: string[];
                        _cached?: boolean;
                        _stale?: boolean;
                    };
                    stale._cached = true;
                    stale._stale = true;
                    return NextResponse.json(stale, {
                        headers: cacheStaleHeaders("suggest-fallback"),
                    });
                }
            }
        } catch {
            // ignore
        }
        console.error(e);
        return NextResponse.json(
            { suggestions: [] },
            { headers: { "x-cache": "MISS", "cache-control": "no-store" } }
        );
    }
}
