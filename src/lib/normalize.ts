/** Raw ES document shape (known fields + open for extras) */
export interface ESRawDoc {
    // collection / db
    db?: string;
    DB?: string;
    database?: string;

    // identifiers
    bildnummer?: string | number;
    media_id?: string | number;
    mediaId?: string | number;
    image_id?: string | number;
    imageId?: string | number;
    id?: string | number;

    // dates
    datum?: string;
    date?: string;
    createdAt?: string;
    created_at?: string;
    captureDate?: string;
    Date?: string;

    // text / titles
    suchtext?: string;
    titel?: string;
    title?: string;
    Title?: string;
    headline?: string;
    Headline?: string;
    caption?: string;

    // description
    description?: string;
    abstract?: string;
    summary?: string;
    captionLong?: string;
    Description?: string;

    // allow unknowns
    [key: string]: unknown;
}

export type ImagoHit = {
    _id: string;
    _source?: ESRawDoc;
};

export type NormalizedDoc = {
    id: string;
    title: string;
    description?: string;
    /** normalized for URLs/UI: 'st' | 'sp' (falls back to 'st' if unknown) */
    db: "st" | "sp" | string;
    /** preferred: bildnummer (string digits), otherwise other ids/_id */
    mediaId: string;
    /** 10-char left-padded numeric id */
    paddedMediaId: string;
    /** `${base}/bild/${db}/${padded}/s.jpg` */
    thumbnailUrl: string;
    /** ISO date if present */
    date?: string;
    /** full raw source for debugging */
    raw: ESRawDoc;
};

/** Safely coerce a value into a non-empty string if possible */
function asNonEmptyString(v: unknown): string | undefined {
    if (typeof v === "string") {
        const s = v.trim();
        return s.length ? s : undefined;
    }
    if (typeof v === "number") return String(v);
    return undefined;
}

/** Try several keys and return first non-empty string */
function pickString<T extends Record<string, unknown>>(
    obj: T | undefined,
    keys: readonly string[]
): string | undefined {
    if (!obj) return undefined;
    for (const k of keys) {
        const val = asNonEmptyString(obj[k]);
        if (val !== undefined) return val;
    }
    return undefined;
}

/** Left-pad numeric id to 10 chars (removes non-digits first) */
export function padMediaId(id: string): string {
    const clean = (id ?? "").toString().replace(/\D/g, "");
    return clean.padStart(10, "0");
}

/** Map raw db values to normalized short codes used in URLs */
function normalizeDb(db: string | undefined): "st" | "sp" | string {
    const v = (db ?? "").toLowerCase();
    if (v === "stock" || v === "st") return "st";
    if (v === "sport" || v === "sp") return "sp";
    // default to 'st' if unknown/empty to keep URLs working
    return v || "st";
}

export function buildThumbUrl(
    base: string,
    normalizedDb: string,
    mediaId: string
): string {
    const padded = padMediaId(mediaId);
    return `${base}/bild/${normalizedDb}/${padded}/s.jpg`;
}

export function normalizeHit(hit: ImagoHit, baseUrl: string): NormalizedDoc {
    const src: ESRawDoc = hit._source ?? {};

    // Title preference (EN + DE fallbacks), then suchtext, then fallback
    const title =
        pickString(src, [
            "title",
            "headline",
            "caption",
            "Title",
            "Headline",
            "titel",
        ]) ??
        pickString(src, ["suchtext"]) ??
        "Untitled";

    // Optional description
    const description = pickString(src, [
        "description",
        "abstract",
        "summary",
        "captionLong",
        "Description",
    ]);

    // db normalize from raw ('stock'|'sport') to ('st'|'sp')
    const dbRaw =
        pickString(src, ["db"]) ??
        pickString(src, ["DB"]) ??
        pickString(src, ["database"]);
    const db = normalizeDb(dbRaw);

    // media id: strongly prefer 'bildnummer'
    const mediaId =
        pickString(src, ["bildnummer"]) ??
        pickString(src, ["media_id", "mediaId", "image_id", "imageId", "id"]) ??
        hit._id;

    // date from 'datum' primarily
    const date =
        pickString(src, ["datum"]) ??
        pickString(src, [
            "date",
            "createdAt",
            "created_at",
            "captureDate",
            "Date",
        ]);

    const paddedMediaId = padMediaId(mediaId);
    const thumbnailUrl = buildThumbUrl(baseUrl, db, mediaId);

    return {
        id: hit._id,
        title,
        description,
        db,
        mediaId,
        paddedMediaId,
        thumbnailUrl,
        date,
        raw: src,
    };
}
