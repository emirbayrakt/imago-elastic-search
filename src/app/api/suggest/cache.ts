import { redis } from "@/lib/redis";

// cache key
export function cacheKey(
    qLower: string,
    db: string,
    start?: string | null,
    end?: string | null
) {
    return `imago:suggest:v1:q=${encodeURIComponent(qLower)}&db=${db}&start=${
        start || ""
    }&end=${end || ""}`;
}

export async function readCache(
    key: string
): Promise<{ suggestions: string[]; _cached?: boolean } | null> {
    if (!redis) return null;
    const str = await redis.get(key);
    if (!str) return null;
    return JSON.parse(str) as { suggestions: string[]; _cached?: boolean };
}

export async function writeCache(
    key: string,
    payload: { suggestions: string[]; _cached?: boolean },
    ttlSeconds: number
): Promise<void> {
    if (!redis) return;
    await redis.set(key, JSON.stringify(payload), "EX", ttlSeconds);
}
