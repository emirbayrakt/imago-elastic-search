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

export { mapFilterDbParam, sanitizeQuery, isNumericQuery, cacheKey };
