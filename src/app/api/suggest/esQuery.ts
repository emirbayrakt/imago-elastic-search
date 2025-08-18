type BuildArgs = {
    q: string;
    dbParam: string;
    start: string | null;
    end: string | null;
};

function mapDbVals(dbParam: string): string[] {
    return dbParam
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean)
        .map((v) => (v === "st" ? "stock" : v === "sp" ? "sport" : v));
}

export function buildSuggestBody({
    q,
    dbParam,
    start,
    end,
}: BuildArgs): Record<string, unknown> {
    const filter: unknown[] = [];

    if (dbParam) {
        const vals = mapDbVals(dbParam);
        if (vals.length === 1) {
            filter.push({ term: { db: vals[0] } });
        } else if (vals.length > 1) {
            filter.push({
                bool: {
                    should: vals.map((v) => ({ term: { db: v } })),
                    minimum_should_match: 1,
                },
            });
        }
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

    return {
        track_total_hits: false,
        size: 200,
        terminate_after: 400,
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
}
