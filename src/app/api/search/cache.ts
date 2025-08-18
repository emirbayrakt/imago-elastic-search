import { redis } from "@/lib/redis";
import { log } from "@/lib/logger";
import { SearchCacheEntry } from "./types";

export async function readFreshCache(
    key: string
): Promise<SearchCacheEntry | null> {
    if (!redis) return null;
    try {
        const cachedStr = await redis.get(key);
        if (!cachedStr) return null;
        const cached = JSON.parse(cachedStr) as SearchCacheEntry;
        return cached;
    } catch (e) {
        log({
            level: "warn",
            msg: "search_cache_read_error",
            key,
            error: e instanceof Error ? e.message : String(e),
        });
        return null;
    }
}

export async function writeCache(
    key: string,
    payload: SearchCacheEntry,
    ttlSeconds: number,
    reqLogBase: Record<string, unknown>
): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(payload), "EX", ttlSeconds);
    } catch (e) {
        log({
            level: "warn",
            msg: "search_cache_write_error",
            ...reqLogBase,
            error: e instanceof Error ? e.message : String(e),
        });
    }
}

type TryServeArgs = {
    err: unknown;
    bypassCache: boolean;
    canUseRedis: boolean;
    key: string;
    reqLogBase: Record<string, unknown>;
};

export async function tryServeStaleOnError({
    err,
    bypassCache,
    canUseRedis,
    key,
    reqLogBase,
}: TryServeArgs): Promise<SearchCacheEntry | null> {
    if (bypassCache || !canUseRedis || !redis) return null;

    try {
        const cachedStr = await redis.get(key);
        if (!cachedStr) return null;

        const stale = JSON.parse(cachedStr) as SearchCacheEntry;
        stale._cached = true;
        stale._stale = true;

        log({
            level: "warn",
            msg: "search_stale_serve",
            ...reqLogBase,
            total: stale.total,
            error: err instanceof Error ? err.message : String(err),
        });

        return stale;
    } catch {
        return null;
    }
}
