import { isNumericQuery, mapFilterDbParam } from "./utils/helpers";

type BuildArgs = {
    q: string;
    dbFilterParam: string;
    start?: string;
    end?: string;
    from: number;
    size: number;
};

export function buildEsBody({
    q,
    dbFilterParam,
    start,
    end,
    from,
    size,
}: BuildArgs): Record<string, unknown> {
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

    return {
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
}
