import { NextRequest, NextResponse } from "next/server";
import { es } from "@/lib/es";
import withTimeout from "@/lib/timeout";
import { ensureRedis, redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const INDEX = process.env.IMAGO_INDEX || "imago";
const SUGGEST_TTL_SECONDS = Number(process.env.SUGGEST_TTL_SECONDS || 600);

// ---- helpers
const sanitize = (s: string) => s.replace(/\s+/g, " ").trim();

// strip punctuation at edges but keep intra-word hyphens/apostrophes
function stripPunct(s: string): string {
    return (s || "")
        .replace(/^[^a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]+/i, "")
        .replace(/[^a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]+$/i, "");
}

// token = original + lower + isWord flag
type Tok = { orig: string; lower: string; isWord: boolean };

// break field into alternating tokens (words/spaces/punct), marking word-like chunks
function lex(field: string): Tok[] {
    const parts = (field || "").split(/(\s+)/);
    return parts
        .filter((p) => p.length > 0)
        .map((p) => {
            const cleaned = stripPunct(p);
            const isWord = /[a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]/i.test(
                cleaned
            );
            return { orig: cleaned || p, lower: cleaned.toLowerCase(), isWord };
        });
}

type Src = Partial<
    Record<
        | "title"
        | "headline"
        | "titel"
        | "suchtext"
        | "caption"
        | "summary"
        | "description",
        string
    >
>;

// Build 1-grams and 2-grams that start with the given prefix (supports 1 or 2 words)
function collectCandidates(src: Src, prefixLower: string): string[] {
    const fields = [
        src.title,
        src.headline,
        src.titel,
        src.caption,
        src.summary,
        src.description,
        src.suchtext,
    ].filter(Boolean) as string[];

    const out: string[] = [];
    const hasTwoWordPrefix = prefixLower.includes(" ");
    const prefixParts = hasTwoWordPrefix
        ? prefixLower.split(/\s+/).filter(Boolean)
        : [prefixLower];

    for (const field of fields) {
        const toks = lex(field);

        // indices of real words
        const wordIdx: number[] = [];
        for (let i = 0; i < toks.length; i++) {
            if (toks[i].isWord && toks[i].lower.length >= 2) wordIdx.push(i);
        }

        for (let wi = 0; wi < wordIdx.length; wi++) {
            const i = wordIdx[wi];
            const t = toks[i];

            if (!hasTwoWordPrefix) {
                if (!t.lower.startsWith(prefixLower)) continue;

                // 1-gram
                if (t.orig) out.push(t.orig);

                // prev + token (backward bigram)
                const prevI = wi > 0 ? wordIdx[wi - 1] : -1;
                if (prevI >= 0) {
                    const phrase = `${toks[prevI].orig} ${t.orig}`.trim();
                    if (phrase) out.push(phrase);
                }

                // token + next (forward bigram)
                const nextI = wi < wordIdx.length - 1 ? wordIdx[wi + 1] : -1;
                if (nextI >= 0) {
                    const phrase = `${t.orig} ${toks[nextI].orig}`.trim();
                    if (phrase) out.push(phrase);
                }
            } else {
                // two-word prefix: need (token + nextWord) to start with both parts
                const nextI = wi < wordIdx.length - 1 ? wordIdx[wi + 1] : -1;
                if (nextI < 0) continue;
                const bigramLower = `${t.lower} ${toks[nextI].lower}`;
                if (
                    !bigramLower.startsWith(
                        `${prefixParts[0]} ${prefixParts[1]}`
                    )
                )
                    continue;

                const phrase = `${t.orig} ${toks[nextI].orig}`.trim();
                if (phrase) out.push(phrase);
            }
        }
    }

    return out;
}

// simple tokenizer for counting words
function tokenizeCount(text: string): number {
    return (text || "")
        .toLowerCase()
        .split(/[^a-z0-9äöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ'-]+/i)
        .filter((t) => t.length >= 2).length;
}

// cache key
function cacheKey(
    q: string,
    db: string,
    start?: string | null,
    end?: string | null
) {
    return `imago:suggest:v1:q=${encodeURIComponent(
        q.toLowerCase()
    )}&db=${db}&start=${start || ""}&end=${end || ""}`;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const qRaw = searchParams.get("q") || "";
        const q = sanitize(qRaw);
        if (q.length < 2) {
            return NextResponse.json(
                { suggestions: [] },
                {
                    headers: { "x-cache": "SKIP", "cache-control": "no-store" },
                }
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
                const cached = await redis.get(key);
                if (cached) {
                    return NextResponse.json(JSON.parse(cached), {
                        headers: {
                            "x-cache": "HIT",
                            "cache-control": "no-store",
                        },
                    });
                }
            } catch (e) {
                console.warn("[redis] suggest read error:", e);
            }
        }

        // Build filters for ES
        const filter = [];
        if (dbParam) {
            const vals = dbParam
                .split(",")
                .map((v) => v.trim().toLowerCase())
                .filter(Boolean)
                .map((v) => (v === "st" ? "stock" : v === "sp" ? "sport" : v));
            if (vals.length === 1) filter.push({ term: { db: vals[0] } });
            else
                filter.push({
                    bool: {
                        should: vals.map((v) => ({ term: { db: v } })),
                        minimum_should_match: 1,
                    },
                });
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

        // ES prefix search on text fields (no fuzziness)
        const body: Record<string, unknown> = {
            track_total_hits: false,
            size: 200, // a bit more breadth
            terminate_after: 400, // gentle on cluster
            _source: [
                "title",
                "headline",
                "titel",
                "suchtext",
                "caption",
                "summary",
                "description",
            ],
            query: {
                bool: {
                    should: [
                        {
                            multi_match: {
                                query: q,
                                type: "phrase_prefix",
                                slop: 0,
                                fields: [
                                    "title^6",
                                    "headline^5",
                                    "titel^5",
                                    "suchtext^4",
                                    "caption^3",
                                    "summary^2",
                                    "description^2",
                                ],
                            },
                        },
                    ],
                    filter,
                    minimum_should_match: 1,
                },
            },
        };

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

                const grams = tokenizeCount(s);
                if (grams === 0 || grams > 2) continue; // only 1-grams and 2-grams

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

        // Title-case first letter of each word for display (keeps internal apostrophes/hyphens)
        const toNice = (s: string) =>
            s.replace(/\b([a-zäöüßàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ])/g, (m) =>
                m.toUpperCase()
            );

        const suggestions = ranked
            .slice(0, 8)
            .map(([, v]) => toNice(v.display));
        const payload = { suggestions, _cached: false };

        // Write cache
        if (!bypassCache && canUseRedis && redis) {
            try {
                await redis.set(
                    key,
                    JSON.stringify(payload),
                    "EX",
                    SUGGEST_TTL_SECONDS
                );
            } catch (e) {
                console.warn("[redis] suggest write error:", e);
            }
        }

        return NextResponse.json(payload, {
            headers: { "x-cache": "MISS", "cache-control": "no-store" },
        });
    } catch (e) {
        // Serve stale if available
        try {
            const { searchParams } = new URL(req.url);
            const key = cacheKey(
                sanitize(searchParams.get("q") || "").toLowerCase(),
                searchParams.get("db") || "",
                searchParams.get("start"),
                searchParams.get("end")
            );
            if (await ensureRedis()) {
                const cached = await redis?.get(key);
                if (cached) {
                    const stale = JSON.parse(cached);
                    stale._cached = true;
                    stale._stale = true;
                    return NextResponse.json(stale, {
                        headers: {
                            "x-cache": "STALE",
                            "cache-control": "no-store",
                            "x-error": "suggest-fallback",
                        },
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
